import { DEFAULT_COLUMN, DEFAULT_OPENING, DEFAULT_OPENING_WIDTH, WALL_THICKNESS_BY_KIND } from "@/data/structure";
import { length, openingOffsetAt } from "@/lib/geometry";
import { ID_PREFIX, nextElementId } from "@/lib/plan";
import type { FloorPlan, Opening, Point } from "@/schemas/floor-plan";

const ids = (items: { id: string }[]) => items.map((item) => item.id);

// Everything drawn by hand starts confirmed (confidence 1); the new id is returned so the editor can select it
export function addWall(plan: FloorPlan, start: Point, end: Point, level: number): { plan: FloorPlan; id: string } | null {
  if (length(start, end) === 0) return null;
  const id = nextElementId(ids(plan.walls), ID_PREFIX.wall, level);
  const wall = { id, x1: start.x, y1: start.y, x2: end.x, y2: end.y, kind: "load_bearing" as const, thickness: WALL_THICKNESS_BY_KIND.load_bearing, level, confidence: 1 };
  return { plan: { ...plan, walls: [...plan.walls, wall] }, id };
}

export function addColumn(plan: FloorPlan, point: Point, level: number): { plan: FloorPlan; id: string } {
  const id = nextElementId(ids(plan.columns), ID_PREFIX.column, level);
  return { plan: { ...plan, columns: [...plan.columns, { id, x: point.x, y: point.y, ...DEFAULT_COLUMN, level, confidence: 1 }] }, id };
}

export function addOpening(plan: FloorPlan, wallId: string, kind: Opening["kind"], point: Point): { plan: FloorPlan; id: string } | null {
  const wall = plan.walls.find((item) => item.id === wallId);
  if (!wall) return null;
  const width = DEFAULT_OPENING_WIDTH[kind];
  const offset = openingOffsetAt(wall, point, width, plan.meta.scale);
  if (offset === null) return null;
  const id = nextElementId(ids(plan.openings.filter((opening) => opening.kind === kind)), ID_PREFIX[kind], wall.level);
  const opening: Opening = { id, wallId, kind, offset, width, ...DEFAULT_OPENING[kind], confidence: 1 };
  return { plan: { ...plan, openings: [...plan.openings, opening] }, id };
}

export function addRoom(plan: FloorPlan, polygon: Point[], level: number): { plan: FloorPlan; id: string } | null {
  if (polygon.length < 3) return null;
  const id = nextElementId(ids(plan.rooms), ID_PREFIX.room, level);
  const name = `Room ${plan.rooms.filter((room) => room.level === level).length + 1}`;
  return { plan: { ...plan, rooms: [...plan.rooms, { id, name, polygon, level, confidence: 1 }] }, id };
}
