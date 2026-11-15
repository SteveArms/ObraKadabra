import { WORKDAYS_PER_WEEK } from "@/data/yields";
import type { ActualProgress, ElementStatus, Schedule, ScheduledTask } from "@/schemas/schedule";

export function weekEndDay(week: number): number {
  return week * WORKDAYS_PER_WEEK;
}

export function plannedStatus(task: ScheduledTask, week: number): ElementStatus {
  const day = weekEndDay(week);
  if (task.endDay <= day) return "done";
  return task.startDay < day ? "in_progress" : "not_started";
}

// Real progress wins over the plan; anything behind what the plan expects by this week is delayed
function actualStatus(task: ScheduledTask, week: number, percent: number | undefined): ElementStatus {
  const planned = plannedStatus(task, week);
  const actual = percent ?? 0;
  if (actual >= 100) return "done";
  if (planned === "done" || (planned === "in_progress" && actual === 0)) return "delayed";
  return actual > 0 ? "in_progress" : "not_started";
}

// Status of every mesh at the end of a week: the plan alone, or plan against reported progress
export function statusAt(schedule: Schedule, week: number, progress?: ActualProgress): Record<string, ElementStatus> {
  const statuses: Record<string, ElementStatus> = {};
  for (const task of schedule.tasks) {
    if (!task.meshKey) continue;
    statuses[task.meshKey] = progress ? actualStatus(task, week, progress.percents[task.meshKey]) : plannedStatus(task, week);
  }
  return statuses;
}

export function taskForMesh(schedule: Schedule, meshKey: string): ScheduledTask | undefined {
  return schedule.tasks.find((task) => task.meshKey === meshKey);
}

// Walls whose plaster is finished by the end of a week, keyed by wall mesh; the 3D model swaps brick for plaster on them
export function plasteredAt(schedule: Schedule, week: number): Record<string, boolean> {
  const day = weekEndDay(week);
  const done = schedule.tasks.filter((task) => task.stage === "finishes" && task.elementType === "wall" && task.endDay <= day);
  return Object.fromEntries(done.map((task) => [`wall_${task.elementId}`, true]));
}
