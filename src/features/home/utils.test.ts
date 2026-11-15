import { describe, expect, it } from "vitest";
import type { ProjectSummary } from "@/lib/schedule";
import { aggregatePortfolio } from "./utils";

function makeSummary(total: number, builtArea: number, durationWeeks: number): ProjectSummary {
  const byStage = { foundation: 0, columns: 0, beams_slab: 0, walls: 0, roof: 0, finishes: 0 };
  return { builtArea, levels: 1, durationWeeks, cost: { materials: total, labor: 0, total, byStage } };
}

describe("aggregatePortfolio", () => {
  it("adds budgets and areas and averages the duration", () => {
    expect(aggregatePortfolio([makeSummary(1000, 90, 12), makeSummary(500, 60, 9)])).toEqual({
      projects: 2,
      totalBudget: 1500,
      builtArea: 150,
      averageWeeks: 11,
    });
  });

  it("has no average duration without projects", () => {
    expect(aggregatePortfolio([])).toEqual({ projects: 0, totalBudget: 0, builtArea: 0, averageWeeks: null });
  });
});
