import type { MeshType } from "@/lib/gltf";
import type { FloorPlan } from "@/schemas/floor-plan";
import { FOUNDATION_LEVEL } from "@/lib/plan/elevations";

export const ELEMENT_TYPE_LABELS: Record<MeshType, string> = {
  wall: "Wall",
  column: "Column",
  slab: "Slab",
  footing: "Footing",
  roof: "Roof",
  door: "Door",
  window: "Window",
};

export function levelLabel(level: number): string {
  return level === FOUNDATION_LEVEL ? "Foundation" : `Floor ${level}`;
}

// Levels a viewer can cut at: the foundation plus every floor of the plan
export function levelCuts(plan: FloorPlan): number[] {
  return Array.from({ length: plan.meta.levels + 1 }, (_, level) => level);
}

export function elementLevel(plan: FloorPlan, type: MeshType, id: string): number | undefined {
  const byId = <T extends { id: string }>(items: T[]) => items.find((item) => item.id === id);
  if (type === "footing") return byId(plan.footings) ? FOUNDATION_LEVEL : undefined;
  if (type === "door" || type === "window") {
    const opening = byId(plan.openings);
    return opening ? plan.walls.find((wall) => wall.id === opening.wallId)?.level : undefined;
  }
  const collections = { wall: plan.walls, column: plan.columns, slab: plan.slabs, roof: plan.roofs };
  return byId<{ id: string; level: number }>(collections[type])?.level;
}
