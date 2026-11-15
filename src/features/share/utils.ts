import { whatsappUrl } from "@/lib/whatsapp";
import { actualProgressAt, actualProgressFrom, earnedValueAt, plannedProgressAt } from "@/lib/schedule";
import type { ProgressEntry } from "@/schemas/progress";
import type { Activity, Schedule } from "@/schemas/schedule";

export type FamilyTone = "not_started" | "planned" | "ahead" | "on_track" | "behind" | "finished";

// Two points of the whole project either way still reads as "on plan" to a family
const ON_PLAN_TOLERANCE = 0.02;

export const TONE_MESSAGES: Record<FamilyTone, string> = {
  not_started: "Work starts soon. This page fills up as the house goes up.",
  planned: "Going by the plan. Site photos approved by the foreman will confirm each step.",
  ahead: "Ahead of plan. The crew is moving faster than expected.",
  on_track: "Everything is going to plan.",
  behind: "A little behind plan. The crew is catching up.",
  finished: "The house is finished. Welcome home!",
};

// Without approved photos the only honest claim is the plan itself, so the tone says so instead of "on track"
export function familyTone(actual: number, planned: number, reported: boolean): FamilyTone {
  if (actual >= 0.999) return "finished";
  if (actual <= 0) return "not_started";
  if (!reported) return "planned";
  if (actual - planned > ON_PLAN_TOLERANCE) return "ahead";
  if (planned - actual > ON_PLAN_TOLERANCE) return "behind";
  return "on_track";
}

export function addWeeks(isoDate: string, weeks: number): string {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

// The slab pour ("techado") is the milestone Peruvian families celebrate, so it is the next party to wait for
export function nextCelebration(schedule: Schedule, week: number): Activity | undefined {
  return schedule.activities.filter((activity) => (activity.stage === "beams_slab" || activity.stage === "roof") && activity.endWeek > week).sort((a, b) => a.endWeek - b.endWeek)[0];
}

export type FamilySummary = { percent: number; tone: FamilyTone; invested: number; total: number; weeksLeft: number; celebration?: Activity };

// Everything the family sees about "today": reported progress where the foreman approved photos, the plan elsewhere
export function familySummary(schedule: Schedule, entries: ProgressEntry[], week: number): FamilySummary {
  const progress = week > 0 ? actualProgressFrom(entries, week) : undefined;
  const percent = week > 0 ? actualProgressAt(schedule, week, progress) : 0;
  return {
    percent,
    tone: familyTone(percent, week > 0 ? plannedProgressAt(schedule, week) : 0, Boolean(progress)),
    invested: week > 0 ? earnedValueAt(schedule, week, progress) : 0,
    total: schedule.totalCost,
    weeksLeft: Math.max(0, schedule.totalWeeks - week),
    celebration: nextCelebration(schedule, week),
  };
}

export function latestPhotoEntry(entries: ProgressEntry[]): ProgressEntry | undefined {
  return entries.filter((entry) => entry.approved && entry.hasPhoto).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
}

export function whatsappShareUrl(link: string): string {
  return whatsappUrl(`Follow how our future home is coming along: ${link}`);
}
