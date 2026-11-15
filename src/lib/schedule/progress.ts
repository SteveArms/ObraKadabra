import type { ProgressEntry, ProgressFinding } from "@/schemas/progress";
import type { ActualProgress, Schedule, ScheduledTask } from "@/schemas/schedule";
import { taskFraction } from "./curve";
import { weekEndDay } from "./status";

export function meshKeyOfFinding(finding: Pick<ProgressFinding, "type" | "elementId">): string {
  return `${finding.type}_${finding.elementId}`;
}

// A finished element counts as 100% whatever percent the photo estimated; one not started counts as 0%
export function findingPercent(finding: Pick<ProgressFinding, "status" | "percent">): number {
  if (finding.status === "done") return 100;
  if (finding.status === "not_started") return 0;
  return Math.min(Math.max(finding.percent, 1), 99);
}

// Approved logs in date order: the latest report of each element wins
export function actualProgressFrom(entries: ProgressEntry[], week: number): ActualProgress | undefined {
  const approved = entries.filter((entry) => entry.approved).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  if (approved.length === 0) return undefined;
  const percents: Record<string, number> = {};
  for (const finding of approved.flatMap((entry) => entry.findings)) percents[meshKeyOfFinding(finding)] = findingPercent(finding);
  return { week, percents };
}

// Share of a task done by the end of the week: what was reported, or the plan where nothing was reported
export function actualFraction(task: ScheduledTask, week: number, progress?: ActualProgress): number {
  const reported = task.meshKey ? progress?.percents[task.meshKey] : undefined;
  return reported === undefined ? taskFraction(task, weekEndDay(week)) : reported / 100;
}

export function actualProgressAt(schedule: Schedule, week: number, progress?: ActualProgress): number {
  if (schedule.totalDays === 0) return 0;
  const done = schedule.tasks.reduce((sum, task) => sum + (task.endDay - task.startDay) * actualFraction(task, week, progress), 0);
  return done / schedule.totalDays;
}

// Earned value: the budget of the work actually built, the "valorización" of Peruvian site reports
export function earnedValueAt(schedule: Schedule, week: number, progress?: ActualProgress): number {
  return schedule.tasks.reduce((sum, task) => sum + task.cost * actualFraction(task, week, progress), 0);
}

// What one finding adds: the share of the whole project it represents and its value in soles
export function findingImpact(schedule: Schedule, finding: ProgressFinding): { progress: number; value: number } {
  const task = schedule.tasks.find((item) => item.meshKey === meshKeyOfFinding(finding));
  if (!task || schedule.totalDays === 0) return { progress: 0, value: 0 };
  const share = findingPercent(finding) / 100;
  return { progress: ((task.endDay - task.startDay) * share) / schedule.totalDays, value: task.cost * share };
}
