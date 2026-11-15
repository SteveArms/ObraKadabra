import type { FloorPlan, FloorPlanMeta } from "@/schemas/floor-plan";
import type { LevelPlan } from "@/schemas/plan-extraction";
import { mergeLevels } from "./levels";
import { deriveStructure } from "./structure";

export type ProjectDetails = Omit<FloorPlanMeta, "scale">;

// Turns the floors read by the AI plus the project details into one FloorPlan ready for the editor
export function assemblePlan(plans: LevelPlan[], details: ProjectDetails): FloorPlan {
  const { scale, ...elements } = mergeLevels(plans, details.levels);
  const meta: FloorPlanMeta = { ...details, scale };
  return { meta, ...elements, ...deriveStructure({ meta, walls: elements.walls, columns: elements.columns }) };
}
