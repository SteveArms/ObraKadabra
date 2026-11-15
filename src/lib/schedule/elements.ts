import type { FloorPlan } from "@/schemas/floor-plan";
import type { Stage } from "@/schemas/schedule";
import type { TakeoffLine } from "@/schemas/takeoff";

// Which mesh appears when a stage builds an element: the wall mesh shows up with its masonry, not with its strip footing
const MESH_STAGES: Partial<Record<TakeoffLine["elementType"], Stage>> = {
  footing: "foundation",
  column: "columns",
  slab: "beams_slab",
  wall: "walls",
  roof: "roof",
};

export function meshKeyOf(plan: FloorPlan, line: TakeoffLine): string | undefined {
  if (MESH_STAGES[line.elementType] !== line.stage) return undefined;
  if (line.elementType === "footing" && !plan.footings.some((footing) => footing.id === line.elementId)) return undefined;
  return `${line.elementType}_${line.elementId}`;
}

export function lineLevel(plan: FloorPlan, line: TakeoffLine): number {
  if (line.stage === "foundation") return 0;
  const byId = <T extends { id: string; level: number }>(items: T[]) => items.find((item) => item.id === line.elementId)?.level;
  const wallLevel = byId(plan.walls);
  if (line.elementType === "wall" || line.elementType === "beam") return wallLevel ?? 1;
  const collections = { column: plan.columns, slab: plan.slabs, roof: plan.roofs, room: plan.rooms };
  const items = collections[line.elementType as keyof typeof collections];
  return (items ? byId<{ id: string; level: number }>(items) : undefined) ?? 1;
}
