import type { FloorPlan } from "@/schemas/floor-plan";

export const FOUNDATION_LEVEL = 0;

export function levelBase(plan: FloorPlan, level: number): number {
  return (level - 1) * plan.meta.floorHeight;
}

// The slab or roof that closes a level sits inside its height, so walls and columns stop under it
export function levelTopThickness(plan: FloorPlan, level: number): number {
  const top = [...plan.slabs, ...plan.roofs].find((surface) => surface.level === level);
  return top?.thickness ?? 0;
}

export function levelClearHeight(plan: FloorPlan, level: number): number {
  return plan.meta.floorHeight - levelTopThickness(plan, level);
}
