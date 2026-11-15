import { CONFINING_BEAM } from "@/data/structure";
import { polygonArea, wallArea } from "@/lib/geometry";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { TakeoffLine } from "@/schemas/takeoff";
import { makeLine } from "./line";

// Masonry stops under the confining beam; column overlaps are ignored, as is usual in quick takeoffs
function masonryHeight(plan: FloorPlan): number {
  return plan.meta.floorHeight - CONFINING_BEAM.height;
}

export function wallLines(plan: FloorPlan): TakeoffLine[] {
  return plan.walls.map((wall) => {
    const surface = wallArea(wall, masonryHeight(plan), plan.openings, plan.meta.scale);
    const item = wall.kind === "load_bearing" ? "masonry_load_bearing" : "masonry_partition";
    return makeLine("wall", wall.id, "walls", item, surface);
  });
}

export function finishLines(plan: FloorPlan): TakeoffLine[] {
  const plaster = plan.walls.map((wall) => {
    const bothSides = 2 * wallArea(wall, masonryHeight(plan), plan.openings, plan.meta.scale);
    return makeLine("wall", wall.id, "finishes", "plaster", bothSides);
  });
  const floors = plan.rooms.map((room) =>
    makeLine("room", room.id, "finishes", "floor_screed", polygonArea(room.polygon) * plan.meta.scale ** 2),
  );
  return [...plaster, ...floors];
}
