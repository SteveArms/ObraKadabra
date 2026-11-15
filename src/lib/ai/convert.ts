import { DEFAULT_OPENING, WALL_THICKNESSES } from "@/data/structure";
import { closeGaps, mergeCollinear, pixelsToMeters, reattachOpenings, snapAngle } from "@/lib/geometry";
import { numberElements } from "@/lib/plan";
import type { Opening, Wall } from "@/schemas/floor-plan";
import type { ExtractedPlan, LevelPlan } from "@/schemas/plan-extraction";

// Cleanup tolerances in meters, turned into image pixels with the calibrated scale
const SNAP_DEGREES = 3;
const CORNER_GAP_M = 0.1;
const COLLINEAR_M = 0.05;

function closestThickness(meters: number): number {
  return WALL_THICKNESSES.reduce((best, value) => (Math.abs(value - meters) < Math.abs(best - meters) ? value : best));
}

function toWalls(extracted: ExtractedPlan, scale: number, level: number): Wall[] {
  return extracted.walls.map((wall) => snapAngle({ ...wall, level, thickness: closestThickness(pixelsToMeters(wall.thickness, scale)) }, SNAP_DEGREES));
}

function toOpenings(extracted: ExtractedPlan, scale: number): Opening[] {
  return extracted.openings.map((opening) => ({
    ...opening,
    offset: pixelsToMeters(opening.offset, scale),
    width: pixelsToMeters(opening.width, scale),
    ...DEFAULT_OPENING[opening.kind],
  }));
}

function cleanWalls(walls: Wall[], scale: number): Wall[] {
  return mergeCollinear(closeGaps(walls, CORNER_GAP_M / scale), COLLINEAR_M / scale);
}

// Model output (all pixels) to one floor of the FloorPlan: coordinates stay in pixels, sizes become meters
export function toLevelPlan(extracted: ExtractedPlan, scale: number, level: number): LevelPlan {
  const walls = toWalls(extracted, scale, level);
  const cleaned = cleanWalls(walls, scale);
  return numberElements({
    level,
    scale,
    walls: cleaned,
    openings: reattachOpenings(toOpenings(extracted, scale), walls, cleaned, scale),
    columns: extracted.columns.map((column) => ({ ...column, level, w: pixelsToMeters(column.w, scale), d: pixelsToMeters(column.d, scale) })),
    rooms: extracted.rooms.map((room, index) => ({ ...room, level, name: room.name.trim() || `Room ${index + 1}` })),
  });
}
