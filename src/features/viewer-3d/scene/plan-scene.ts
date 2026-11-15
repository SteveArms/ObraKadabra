import { FOUNDATION_DEPTH } from "@/data/structure";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import { FOUNDATION_LEVEL, levelBase, levelClearHeight } from "./elevations";
import type { SceneElement } from "./types";
import { wallBoxes } from "./wall-boxes";

function toXZ(points: Point[], scale: number): [number, number][] {
  return points.map((point) => [point.x * scale, point.y * scale]);
}

function surfaceElements(plan: FloorPlan): SceneElement[] {
  const surfaces = [
    ...plan.slabs.map((slab) => ({ ...slab, type: "slab" as const })),
    ...plan.roofs.map((roof) => ({ ...roof, type: "roof" as const })),
  ];
  return surfaces.map((surface) => ({
    key: `${surface.type}_${surface.id}`,
    id: surface.id,
    type: surface.type,
    level: surface.level,
    shape: {
      kind: "prism",
      prism: {
        polygon: toXZ(surface.polygon, plan.meta.scale),
        bottom: levelBase(plan, surface.level) + plan.meta.floorHeight - surface.thickness,
        thickness: surface.thickness,
      },
    },
  }));
}

function structuralElements(plan: FloorPlan): SceneElement[] {
  const s = plan.meta.scale;
  const footings: SceneElement[] = plan.footings.map((footing) => ({
    key: `footing_${footing.id}`,
    id: footing.id,
    type: "footing",
    level: FOUNDATION_LEVEL,
    shape: { kind: "boxes", boxes: [{ center: [footing.x * s, -FOUNDATION_DEPTH + footing.depth / 2, footing.y * s], size: [footing.w, footing.depth, footing.d], rotationY: 0 }] },
  }));
  const columns: SceneElement[] = plan.columns.map((column) => {
    const height = levelClearHeight(plan, column.level);
    const center: [number, number, number] = [column.x * s, levelBase(plan, column.level) + height / 2, column.y * s];
    return {
      key: `column_${column.id}`,
      id: column.id,
      type: "column",
      level: column.level,
      shape: { kind: "boxes", boxes: [{ center, size: [column.w, height, column.d], rotationY: 0 }] },
    };
  });
  return [...footings, ...columns];
}

// Plan (x, y) maps to world (x, z) with Y up, in meters; one element per footing, column, wall, slab and roof
export function buildPlanScene(plan: FloorPlan): SceneElement[] {
  const walls: SceneElement[] = plan.walls.map((wall) => ({
    key: `wall_${wall.id}`,
    id: wall.id,
    type: "wall",
    level: wall.level,
    shape: { kind: "boxes", boxes: wallBoxes(plan, wall) },
  }));
  return [...structuralElements(plan), ...walls, ...surfaceElements(plan)];
}
