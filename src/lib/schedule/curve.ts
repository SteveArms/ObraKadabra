import type { ActualProgress, Schedule, ScheduledTask } from "@/schemas/schedule";
import { earnedValueAt } from "./progress";
import { weekEndDay } from "./status";

export type CurvePoint = { week: number; planned: number; actual?: number };

// Share of a task done by a given day, assuming steady work between its start and end
export function taskFraction(task: ScheduledTask, day: number): number {
  if (day <= task.startDay) return 0;
  if (day >= task.endDay || task.endDay === task.startDay) return 1;
  return (day - task.startDay) / (task.endDay - task.startDay);
}

export function plannedCostAt(schedule: Schedule, week: number): number {
  const day = weekEndDay(week);
  return schedule.tasks.reduce((sum, task) => sum + task.cost * taskFraction(task, day), 0);
}

// Physical progress weights each task by its working days, not by its cost
export function plannedProgressAt(schedule: Schedule, week: number): number {
  if (schedule.totalDays === 0) return 0;
  const day = weekEndDay(week);
  const done = schedule.tasks.reduce((sum, task) => sum + (task.endDay - task.startDay) * taskFraction(task, day), 0);
  return done / schedule.totalDays;
}

// Planned S-curve from week 0 to the last week; the actual curve is only known at 0 and at the reported week
export function costCurve(schedule: Schedule, progress?: ActualProgress): CurvePoint[] {
  return Array.from({ length: schedule.totalWeeks + 1 }, (_, week) => {
    const point: CurvePoint = { week, planned: plannedCostAt(schedule, week) };
    if (progress && week === 0) point.actual = 0;
    if (progress && week > 0 && week === progress.week) point.actual = earnedValueAt(schedule, week, progress);
    return point;
  });
}
