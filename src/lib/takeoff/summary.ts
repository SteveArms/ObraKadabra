import { polygonArea } from "@/lib/geometry";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { TakeoffLine } from "@/schemas/takeoff";
import { computeCost, type CostBreakdown } from "./cost";
import { foundationLines, columnLines, beamAndSlabLines, roofLines } from "./structure-lines";
import { finishLines, wallLines } from "./finish-lines";

export type TakeoffSummary = {
  builtArea: number;
  levels: number;
  cost: CostBreakdown;
};

export function computeTakeoffLines(plan: FloorPlan): TakeoffLine[] {
  return [
    ...foundationLines(plan),
    ...columnLines(plan),
    ...beamAndSlabLines(plan),
    ...wallLines(plan),
    ...roofLines(plan),
    ...finishLines(plan),
  ];
}

// Built (roofed) area: every slab plus the top roof, the way homes are measured in Peru
export function builtArea(plan: FloorPlan): number {
  const surfaces = [...plan.slabs, ...plan.roofs].map((surface) => polygonArea(surface.polygon));
  return surfaces.reduce((sum, value) => sum + value, 0) * plan.meta.scale ** 2;
}

export function summarizeTakeoff(plan: FloorPlan): TakeoffSummary {
  const lines = computeTakeoffLines(plan);
  return {
    builtArea: builtArea(plan),
    levels: plan.meta.levels,
    cost: computeCost(lines),
  };
}
