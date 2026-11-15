import type { Opening, Wall } from "@/schemas/floor-plan";
import { distanceToSegment, pointAlong, project, wallAxis } from "./segment";

function nearestWall(walls: Wall[], point: { x: number; y: number }, level: number): Wall | undefined {
  let best: { wall: Wall; distance: number } | undefined;
  for (const wall of walls) {
    const axis = wallAxis(wall);
    if (!axis || wall.level !== level) continue;
    const distance = distanceToSegment(point, axis);
    if (!best || distance < best.distance) best = { wall, distance };
  }
  return best?.wall;
}

// After walls are merged or moved, hangs each opening on the wall that now passes through its center (offset and width in meters)
export function reattachOpenings(openings: Opening[], before: Wall[], after: Wall[], scale: number): Opening[] {
  return openings.flatMap((opening) => {
    const source = before.find((wall) => wall.id === opening.wallId);
    const sourceAxis = source && wallAxis(source);
    if (!source || !sourceAxis) return [];
    const center = pointAlong(sourceAxis, (opening.offset + opening.width / 2) / scale);
    const target = nearestWall(after, center, source.level);
    const axis = target && wallAxis(target);
    if (!target || !axis) return [];
    const wallMeters = axis.size * scale;
    const width = Math.min(opening.width, wallMeters);
    const offset = project(center, axis.origin, axis.unit) * scale - width / 2;
    return [{ ...opening, wallId: target.id, width, offset: Math.min(Math.max(offset, 0), wallMeters - width) }];
  });
}
