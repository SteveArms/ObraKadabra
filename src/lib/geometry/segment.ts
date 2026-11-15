import type { Point, Wall } from "@/schemas/floor-plan";
import { length } from "./measure";

export type Axis = { origin: Point; unit: Point; size: number };

export function wallAxis(wall: Wall): Axis | null {
  const origin = { x: wall.x1, y: wall.y1 };
  const size = length(origin, { x: wall.x2, y: wall.y2 });
  if (size === 0) return null;
  return { origin, unit: { x: (wall.x2 - wall.x1) / size, y: (wall.y2 - wall.y1) / size }, size };
}

// Signed distance of the point along the axis, measured from its origin
export function project(point: Point, origin: Point, unit: Point): number {
  return (point.x - origin.x) * unit.x + (point.y - origin.y) * unit.y;
}

export function distanceToLine(point: Point, origin: Point, unit: Point): number {
  return Math.abs((point.x - origin.x) * unit.y - (point.y - origin.y) * unit.x);
}

export function pointAlong(axis: Axis, distance: number): Point {
  return { x: axis.origin.x + axis.unit.x * distance, y: axis.origin.y + axis.unit.y * distance };
}

export function distanceToSegment(point: Point, axis: Axis): number {
  const along = Math.min(Math.max(project(point, axis.origin, axis.unit), 0), axis.size);
  return length(point, pointAlong(axis, along));
}
