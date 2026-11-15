import type { Point, Wall } from "@/schemas/floor-plan";
import { length, wallLength } from "./measure";

export function snapToGrid(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

// Rotates the wall around its start point onto the nearest multiple of 90° when it is within the tolerance
export function snapAngle(wall: Wall, toleranceDeg: number): Wall {
  const angle = (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
  const target = Math.round(angle / 90) * 90;
  if (Math.abs(angle - target) > toleranceDeg || angle === target) return wall;
  const radians = (target * Math.PI) / 180;
  const size = wallLength(wall);
  return {
    ...wall,
    x2: wall.x1 + Math.round(Math.cos(radians)) * size,
    y2: wall.y1 + Math.round(Math.sin(radians)) * size,
  };
}

export function snapToPoint(point: Point, candidates: Point[], tolerance: number): Point | null {
  let best: { point: Point; distance: number } | null = null;
  for (const candidate of candidates) {
    const distance = length(point, candidate);
    if (distance <= tolerance && (!best || distance < best.distance)) best = { point: candidate, distance };
  }
  return best ? { ...best.point } : null;
}

export type EditSnap = { anchor?: Point; vertices: Point[]; gridStep: number; vertexTolerance: number; angleTolerance: number };

// Editor snapping, strongest first: a nearby vertex, then 0/90° from the anchor, then the grid on the free axis
export function snapEditPoint(point: Point, options: EditSnap): Point {
  const vertex = snapToPoint(point, options.vertices, options.vertexTolerance);
  if (vertex) return vertex;
  const grid = { x: snapToGrid(point.x, options.gridStep), y: snapToGrid(point.y, options.gridStep) };
  const { anchor } = options;
  if (!anchor) return grid;
  const probe: Wall = { id: "probe", x1: anchor.x, y1: anchor.y, x2: point.x, y2: point.y, thickness: 1, kind: "partition", level: 1, confidence: 1 };
  const aligned = snapAngle(probe, options.angleTolerance);
  if (aligned.y2 === anchor.y && aligned.x2 !== anchor.x) return { x: grid.x, y: anchor.y };
  if (aligned.x2 === anchor.x && aligned.y2 !== anchor.y) return { x: anchor.x, y: grid.y };
  return grid;
}
