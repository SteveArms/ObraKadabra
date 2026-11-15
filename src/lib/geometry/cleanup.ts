import type { Point, Wall } from "@/schemas/floor-plan";
import { length } from "./measure";

type Segment = { start: Point; end: Point };

function toSegment(wall: Wall): Segment {
  return { start: { x: wall.x1, y: wall.y1 }, end: { x: wall.x2, y: wall.y2 } };
}

function project(point: Point, origin: Point, unit: Point): number {
  return (point.x - origin.x) * unit.x + (point.y - origin.y) * unit.y;
}

function distanceToLine(point: Point, origin: Point, unit: Point): number {
  return Math.abs((point.x - origin.x) * unit.y - (point.y - origin.y) * unit.x);
}

function canMerge(a: Wall, b: Wall): boolean {
  return a.kind === b.kind && a.level === b.level && a.thickness === b.thickness;
}

// Returns the merged wall when b lies on a's line and both touch or overlap, otherwise null
function mergePair(a: Wall, b: Wall, tolerance: number): Wall | null {
  if (!canMerge(a, b)) return null;
  const { start, end } = toSegment(a);
  const size = length(start, end);
  if (size === 0) return null;
  const unit = { x: (end.x - start.x) / size, y: (end.y - start.y) / size };
  const other = toSegment(b);
  if (distanceToLine(other.start, start, unit) > tolerance) return null;
  if (distanceToLine(other.end, start, unit) > tolerance) return null;
  const [p1, p2] = [project(other.start, start, unit), project(other.end, start, unit)];
  if (Math.min(p1, p2) > size + tolerance || Math.max(p1, p2) < -tolerance) return null;
  const from = Math.min(0, p1, p2);
  const to = Math.max(size, p1, p2);
  return {
    ...a,
    x1: start.x + unit.x * from,
    y1: start.y + unit.y * from,
    x2: start.x + unit.x * to,
    y2: start.y + unit.y * to,
    confidence: Math.min(a.confidence, b.confidence),
  };
}

export function mergeCollinear(walls: Wall[], tolerance: number): Wall[] {
  const result = [...walls];
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const merged = mergePair(result[i], result[j], tolerance);
      if (!merged) continue;
      result[i] = merged;
      result.splice(j, 1);
      j = i;
    }
  }
  return result;
}

// Moves each endpoint onto the first earlier endpoint closer than the tolerance, so corners close exactly
export function closeGaps(walls: Wall[], tolerance: number): Wall[] {
  const anchors: Point[] = [];
  const snap = (point: Point): Point => {
    const anchor = anchors.find((candidate) => length(candidate, point) <= tolerance);
    if (anchor) return anchor;
    anchors.push(point);
    return point;
  };
  return walls.map((wall) => {
    const start = snap({ x: wall.x1, y: wall.y1 });
    const end = snap({ x: wall.x2, y: wall.y2 });
    return { ...wall, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  });
}
