import { wallLength } from "@/lib/geometry";
import type { FloorPlan, Opening, Wall } from "@/schemas/floor-plan";
import { levelBase, levelClearHeight } from "@/lib/plan/elevations";
import type { SceneBox } from "./types";

type Span = { from: number; to: number; bottom: number; top: number };

function openingSpans(opening: Opening, height: number): Span[] {
  const from = opening.offset;
  const to = opening.offset + opening.width;
  const head = opening.sill + opening.height;
  const spans: Span[] = [];
  if (opening.sill > 0) spans.push({ from, to, bottom: 0, top: opening.sill });
  if (head < height) spans.push({ from, to, bottom: head, top: height });
  return spans;
}

// Splits the wall into solid pieces around its openings: full-height piers, sills under windows and lintels above
export function wallSpans(length: number, height: number, openings: Opening[]): Span[] {
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  const spans: Span[] = [];
  let cursor = 0;
  for (const opening of sorted) {
    if (opening.offset > cursor) spans.push({ from: cursor, to: Math.min(opening.offset, length), bottom: 0, top: height });
    spans.push(...openingSpans(opening, height));
    cursor = Math.max(cursor, opening.offset + opening.width);
  }
  if (cursor < length) spans.push({ from: cursor, to: length, bottom: 0, top: height });
  return spans.filter((span) => span.to > span.from && span.top > span.bottom);
}

export function wallBoxes(plan: FloorPlan, wall: Wall): SceneBox[] {
  const scale = plan.meta.scale;
  const length = wallLength(wall) * scale;
  if (length === 0) return [];
  const direction = { x: ((wall.x2 - wall.x1) * scale) / length, z: ((wall.y2 - wall.y1) * scale) / length };
  const base = levelBase(plan, wall.level);
  const openings = plan.openings.filter((opening) => opening.wallId === wall.id);
  return wallSpans(length, levelClearHeight(plan, wall.level), openings).map((span) => {
    const along = (span.from + span.to) / 2;
    return {
      center: [wall.x1 * scale + direction.x * along, base + (span.bottom + span.top) / 2, wall.y1 * scale + direction.z * along],
      size: [span.to - span.from, span.top - span.bottom, wall.thickness],
      rotationY: Math.atan2(-direction.z, direction.x),
    };
  });
}
