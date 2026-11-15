import type { Stage } from "@/schemas/schedule";

export const STAGE_LABELS: Record<Stage, string> = {
  foundation: "Foundation",
  columns: "Columns",
  beams_slab: "Beams & slab",
  walls: "Walls",
  roof: "Roof",
  finishes: "Finishes",
};

export function activityLabel(stage: Stage, level: number): string {
  return level === 0 ? STAGE_LABELS[stage] : `${STAGE_LABELS[stage]} · Floor ${level}`;
}
