import { LABOR_PRICES, MATERIAL_PRICES } from "@/data/prices";
import { STAGES, type Stage } from "@/schemas/schedule";
import type { TakeoffLine } from "@/schemas/takeoff";
import { computeMaterials } from "./materials";

export type CostBreakdown = {
  materials: number;
  labor: number;
  total: number;
  byStage: Record<Stage, number>;
};

export function materialsCost(lines: TakeoffLine[]): number {
  return computeMaterials(lines).reduce((sum, entry) => sum + entry.quantity * MATERIAL_PRICES[entry.material], 0);
}

export function laborCost(lines: TakeoffLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity * LABOR_PRICES[line.item], 0);
}

export function computeCost(lines: TakeoffLine[]): CostBreakdown {
  const byStage = Object.fromEntries(
    STAGES.map((stage) => {
      const stageLines = lines.filter((line) => line.stage === stage);
      return [stage, materialsCost(stageLines) + laborCost(stageLines)];
    }),
  ) as Record<Stage, number>;
  const materials = materialsCost(lines);
  const labor = laborCost(lines);
  return { materials, labor, total: materials + labor, byStage };
}
