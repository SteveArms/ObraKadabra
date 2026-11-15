import { WORKDAYS_PER_WEEK } from "@/data/yields";
import type { Activity, Schedule } from "@/schemas/schedule";

const DAY_MS = 24 * 60 * 60 * 1000;

// Calendar weeks since the project started, clamped to the schedule; undefined without a start date
export function todayWeek(startDate: string | undefined, totalWeeks: number, now = Date.now()): number | undefined {
  if (!startDate) return undefined;
  const days = Math.floor((now - new Date(`${startDate}T00:00:00`).getTime()) / DAY_MS);
  return Math.min(Math.max(1, Math.floor(days / 7) + 1), Math.max(1, totalWeeks));
}

// The activity being worked at the end of a week, or the last finished one
export function activityAt(schedule: Schedule, week: number): Activity | undefined {
  const day = week * WORKDAYS_PER_WEEK;
  const active = schedule.activities.find((activity) => activity.startDay < day && activity.endDay > day);
  return active ?? [...schedule.activities].reverse().find((activity) => activity.endDay <= day) ?? schedule.activities[0];
}

export function activityState(activity: Activity, week: number): "done" | "active" | "future" {
  const day = week * WORKDAYS_PER_WEEK;
  if (activity.endDay <= day) return "done";
  return activity.startDay < day ? "active" : "future";
}

export function weekFromRatio(ratio: number, schedule: Schedule): number {
  const day = Math.min(Math.max(ratio, 0), 1) * schedule.totalDays;
  return Math.min(Math.max(1, Math.ceil(day / WORKDAYS_PER_WEEK)), Math.max(1, schedule.totalWeeks));
}

export function dayRatio(day: number, schedule: Schedule): number {
  return schedule.totalDays === 0 ? 0 : Math.min(day / schedule.totalDays, 1);
}
