import { WORKDAYS_PER_WEEK, YIELDS_PER_CREW_DAY } from "@/data/yields";
import { computeCost } from "@/lib/takeoff";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { Activity, Schedule, ScheduledTask, Stage } from "@/schemas/schedule";
import type { TakeoffItem, TakeoffLine } from "@/schemas/takeoff";
import { lineLevel, meshKeyOf } from "./elements";

export type ScheduleOptions = { yields?: Record<TakeoffItem, number>; crews?: number };

type Draft = Omit<ScheduledTask, "startDay" | "endDay" | "startWeek" | "endWeek" | "cost"> & { days: number };

export function toWeeks(startDay: number, endDay: number) {
  const startWeek = Math.floor(startDay / WORKDAYS_PER_WEEK) + 1;
  return { startWeek, endWeek: Math.max(startWeek, Math.ceil(endDay / WORKDAYS_PER_WEEK)) };
}

// Fixed order (AGENTS.md §8): foundation, then walls → columns → beams & slab floor by floor, the roof and finishes
export function activityOrder(levels: number): { stage: Stage; level: number }[] {
  const floors = Array.from({ length: levels }, (_, index) => index + 1);
  return [
    { stage: "foundation", level: 0 },
    ...floors.flatMap((level) => (["walls", "columns", "beams_slab"] as const).map((stage) => ({ stage, level }))),
    { stage: "roof", level: levels },
    ...floors.map((level) => ({ stage: "finishes" as const, level })),
  ];
}

// Anything the fixed order does not cover (a roof below the top floor, say) still gets scheduled, after the rest
function withLeftovers(order: { stage: Stage; level: number }[], drafts: Draft[]) {
  const seen = new Set(order.map(({ stage, level }) => `${stage}@${level}`));
  const extra = drafts.filter((draft) => !seen.has(`${draft.stage}@${draft.level}`)).map(({ stage, level }) => ({ stage, level }));
  return [...order, ...extra.filter((item, index) => extra.findIndex((other) => `${other.stage}@${other.level}` === `${item.stage}@${item.level}`) === index)];
}

function draftTasks(plan: FloorPlan, lines: TakeoffLine[], yields: Record<TakeoffItem, number>, crews: number): Draft[] {
  const drafts = new Map<string, Draft>();
  for (const line of lines) {
    const key = `${line.stage}:${line.elementType}_${line.elementId}`;
    const draft = drafts.get(key) ?? {
      key,
      stage: line.stage,
      level: lineLevel(plan, line),
      elementType: line.elementType,
      elementId: line.elementId,
      meshKey: meshKeyOf(plan, line),
      lines: [],
      days: 0,
    };
    draft.lines.push(line);
    draft.days += line.quantity / yields[line.item] / crews;
    drafts.set(key, draft);
  }
  return [...drafts.values()];
}

function scheduleActivity(drafts: Draft[], stage: Stage, level: number, startDay: number) {
  let cursor = startDay;
  const tasks: ScheduledTask[] = drafts.map(({ days, ...draft }) => {
    const task = { ...draft, startDay: cursor, endDay: cursor + days, ...toWeeks(cursor, cursor + days), cost: computeCost(draft.lines).total };
    cursor += days;
    return task;
  });
  const activity: Activity = { stage, level, startDay, endDay: cursor, ...toWeeks(startDay, cursor), cost: tasks.reduce((sum, task) => sum + task.cost, 0) };
  return { tasks, activity };
}

// Duration = takeoff ÷ yield per crew; one crew works activities back to back and the tasks inside each one in sequence
export function buildSchedule(plan: FloorPlan, lines: TakeoffLine[], options: ScheduleOptions = {}): Schedule {
  const drafts = draftTasks(plan, lines, options.yields ?? YIELDS_PER_CREW_DAY, Math.max(1, options.crews ?? 1));
  const tasks: ScheduledTask[] = [];
  const activities: Activity[] = [];
  let day = 0;
  for (const { stage, level } of withLeftovers(activityOrder(plan.meta.levels), drafts)) {
    const group = drafts.filter((draft) => draft.stage === stage && draft.level === level);
    if (group.length === 0) continue;
    const scheduled = scheduleActivity(group, stage, level, day);
    tasks.push(...scheduled.tasks);
    activities.push(scheduled.activity);
    day = scheduled.activity.endDay;
  }
  const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);
  return { tasks, activities, totalDays: day, totalWeeks: Math.ceil(day / WORKDAYS_PER_WEEK), totalCost };
}
