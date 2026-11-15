import type { ProjectSummary } from "@/lib/schedule";

export type PortfolioTotals = {
  projects: number;
  totalBudget: number;
  builtArea: number;
  averageWeeks: number | null;
};

export function aggregatePortfolio(summaries: ProjectSummary[]): PortfolioTotals {
  const sum = (pick: (summary: ProjectSummary) => number) => summaries.reduce((total, item) => total + pick(item), 0);
  return {
    projects: summaries.length,
    totalBudget: sum((summary) => summary.cost.total),
    builtArea: sum((summary) => summary.builtArea),
    averageWeeks: summaries.length ? Math.round(sum((summary) => summary.durationWeeks) / summaries.length) : null,
  };
}
