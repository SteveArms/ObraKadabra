import type { Opening, Point, Wall } from "@/schemas/floor-plan";

export function length(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function wallLength(wall: Wall): number {
  return length({ x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 });
}

export function area(width: number, depth: number): number {
  return width * depth;
}

export function volume(width: number, depth: number, height: number): number {
  return width * depth * height;
}

// Shoelace formula; the absolute value makes it independent of vertex order
export function polygonArea(points: Point[]): number {
  if (points.length < 3) return 0;
  const doubled = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  return Math.abs(doubled) / 2;
}

// Area-weighted centroid, so room labels sit inside L-shaped rooms too; degenerate polygons fall back to the vertex average
export function polygonCentroid(points: Point[]): Point {
  let doubled = 0;
  let cx = 0;
  let cy = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const cross = point.x * next.y - next.x * point.y;
    doubled += cross;
    cx += (point.x + next.x) * cross;
    cy += (point.y + next.y) * cross;
  });
  if (doubled === 0) {
    const count = Math.max(points.length, 1);
    return { x: points.reduce((sum, p) => sum + p.x, 0) / count, y: points.reduce((sum, p) => sum + p.y, 0) / count };
  }
  return { x: cx / (3 * doubled), y: cy / (3 * doubled) };
}

export function wallArea(wall: Wall, height: number, openings: Opening[], scale = 1): number {
  const gross = wallLength(wall) * scale * height;
  const voids = openings
    .filter((opening) => opening.wallId === wall.id)
    .reduce((sum, opening) => sum + opening.width * Math.min(opening.height, height), 0);
  return Math.max(0, gross - voids);
}
