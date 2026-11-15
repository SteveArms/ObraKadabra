import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import type { ProgressEntry, ProgressFinding } from "@/schemas/progress";
import { actualProgressAt, actualProgressFrom, earnedValueAt, findingImpact, plannedCostAt, plannedProgressAt, scheduleFor, statusAt } from "./index";

const schedule = scheduleFor(DEMO_PROJECTS[0].floorPlan);
const finding = (elementId: string, type: ProgressFinding["type"], status: ProgressFinding["status"], percent: number): ProgressFinding => ({ elementId, type, status, percent, evidence: "", confidence: 0.9 });

function entry(findings: ProgressFinding[], overrides: Partial<ProgressEntry> = {}): ProgressEntry {
  return { id: "e1", projectId: "casa-1-piso-90", week: 1, levelLabel: "Floor 1", recordedAt: "2026-11-15T10:00:00.000Z", approved: true, hasPhoto: false, findings, ...overrides };
}

describe("actual progress from photo logs", () => {
  it("applying an approved entry changes statusAt for the reported elements only", () => {
    const progress = actualProgressFrom([entry([finding("C-1", "column", "done", 100), finding("M-3", "wall", "in_progress", 50)])], 1);
    const statuses = statusAt(schedule, 1, progress);
    expect(statuses["column_C-1"]).toBe("done");
    expect(statuses["wall_M-3"]).toBe("in_progress");
    expect(statuses["column_C-2"]).toBe(statusAt(schedule, 1)["column_C-2"]);
  });

  it("an element planned as done and reported not started is delayed", () => {
    const column = schedule.tasks.find((task) => task.meshKey === "column_C-1")!;
    const week = column.endWeek + 1;
    expect(statusAt(schedule, week)["column_C-1"]).toBe("done");
    const progress = actualProgressFrom([entry([finding("C-1", "column", "not_started", 0)])], week);
    expect(statusAt(schedule, week, progress)["column_C-1"]).toBe("delayed");
  });

  it("ignores logs waiting for approval and lets the latest report win", () => {
    expect(actualProgressFrom([entry([finding("C-1", "column", "done", 100)], { approved: false })], 1)).toBeUndefined();
    const progress = actualProgressFrom(
      [entry([finding("M-3", "wall", "in_progress", 50)], { recordedAt: "2026-11-16T10:00:00.000Z" }), entry([finding("M-3", "wall", "done", 100)], { id: "e0" })],
      1,
    );
    expect(progress?.percents["wall_M-3"]).toBe(50);
  });

  it("matches the plan with no reports and values each finding with its task cost", () => {
    expect(actualProgressAt(schedule, 3)).toBeCloseTo(plannedProgressAt(schedule, 3));
    expect(earnedValueAt(schedule, 3)).toBeCloseTo(plannedCostAt(schedule, 3));
    const column = schedule.tasks.find((task) => task.meshKey === "column_C-1")!;
    const impact = findingImpact(schedule, finding("C-1", "column", "in_progress", 50));
    expect(impact.value).toBeCloseTo(column.cost / 2);
    expect(impact.progress).toBeCloseTo((column.endDay - column.startDay) / 2 / schedule.totalDays);
  });
});
