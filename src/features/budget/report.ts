import { activityAt } from "@/features/schedule";
import { formatArea, formatCount, formatPercent, formatSoles } from "@/lib/format";
import { activityLabel, actualProgressAt, materialsForWeek, plannedCostAt, plannedProgressAt } from "@/lib/schedule";
import { builtArea, MATERIAL_LABELS, TAKEOFF_ITEM_LABELS, UNIT_LABELS } from "@/lib/takeoff";
import type { Project } from "@/schemas/project";
import type { ActualProgress, Schedule } from "@/schemas/schedule";
import { costByItem, purchaseCost, purchaseQuantity } from "./utils";

export type ReportTable = { title: string; columns: [string, string, string]; rows: [string, string, string][]; total?: string };
export type ProjectReport = { fileName: string; title: string; subtitle: string; facts: [string, string][]; tables: ReportTable[] };

type ReportInput = { project: Project; schedule: Schedule; week: number; progress?: ActualProgress; generatedAt: Date };

const fileSlug = (name: string) => name.normalize("NFD").replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/[\s_]+/g, "-") || "project";

function projectFacts({ project, schedule, week, progress }: ReportInput): [string, string][] {
  const activity = activityAt(schedule, week);
  const facts: [string, string][] = [
    ["Built area", formatArea(builtArea(project.floorPlan))],
    ["Floors", formatCount(project.floorPlan.meta.levels, "floor", "floors")],
    ["Shell budget", formatSoles(schedule.totalCost)],
    ["Duration", formatCount(schedule.totalWeeks, "week", "weeks")],
    ["Active stage", activity ? activityLabel(activity.stage, activity.level) : "Not scheduled"],
    ["Planned progress", formatPercent(plannedProgressAt(schedule, week))],
    ["Planned spend to date", formatSoles(plannedCostAt(schedule, week))],
  ];
  return progress ? [...facts, ["Reported progress", formatPercent(actualProgressAt(schedule, week, progress))]] : facts;
}

function materialsTable(schedule: Schedule, week: number): ReportTable {
  const entries = materialsForWeek(schedule, week);
  const rows = entries.map((entry): [string, string, string] => [MATERIAL_LABELS[entry.material], `${purchaseQuantity(entry)} ${UNIT_LABELS[entry.unit]}`, formatSoles(purchaseCost(entry))]);
  const total = entries.reduce((sum, entry) => sum + purchaseCost(entry), 0);
  return { title: `Materials to buy for week ${week}`, columns: ["Material", "Quantity", "Cost"], rows, total: rows.length ? formatSoles(total) : undefined };
}

// Everything the PDF shows, as plain text, so the layout code never computes and the content can be tested
export function buildReport(input: ReportInput): ProjectReport {
  const { project, schedule, week, generatedAt } = input;
  const items = costByItem(schedule, week).map((item): [string, string, string] => [TAKEOFF_ITEM_LABELS[item.item], formatSoles(item.total), formatSoles(item.invested)]);
  return {
    fileName: `obrakadabra-${fileSlug(project.name)}-week-${week}.pdf`,
    title: project.name,
    subtitle: `Week ${week} of ${schedule.totalWeeks} · ${project.location ? `${project.location} · ` : ""}generated ${generatedAt.toISOString().slice(0, 10)}`,
    facts: projectFacts(input),
    tables: [{ title: "Cost by work item", columns: ["Work item", "Total", "Planned to date"], rows: items, total: formatSoles(schedule.totalCost) }, materialsTable(schedule, week)],
  };
}
