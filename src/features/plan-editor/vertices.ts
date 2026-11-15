import { pointAlong, reattachOpenings, snapEditPoint, wallAxis } from "@/lib/geometry";
import type { FloorPlan, Point, Wall } from "@/schemas/floor-plan";

export type Vertex = { id: string; point: Point };

// Corners closed by the AI cleanup share exact coordinates, so equality is enough to know they are one vertex
function same(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
}

// One handle per distinct wall end on the floor, named after the first wall that reaches it
export function planVertices(plan: FloorPlan, level: number): Vertex[] {
  const vertices: Vertex[] = [];
  for (const wall of plan.walls) {
    if (wall.level !== level) continue;
    const ends: [string, Point][] = [[`${wall.id}-start`, { x: wall.x1, y: wall.y1 }], [`${wall.id}-end`, { x: wall.x2, y: wall.y2 }]];
    for (const [id, point] of ends) if (!vertices.some((vertex) => same(vertex.point, point))) vertices.push({ id, point });
  }
  return vertices;
}

function moveWallEnds(wall: Wall, from: Point, to: Point): Wall {
  const start = same({ x: wall.x1, y: wall.y1 }, from) ? to : { x: wall.x1, y: wall.y1 };
  const end = same({ x: wall.x2, y: wall.y2 }, from) ? to : { x: wall.x2, y: wall.y2 };
  return { ...wall, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}

// Moves the point everywhere it appears on the floor: wall ends, the column on it and room corners; openings follow their wall
export function moveVertex(plan: FloorPlan, level: number, from: Point, to: Point): FloorPlan {
  const onLevel = (item: { level: number }) => item.level === level;
  const walls = plan.walls.map((wall) => (onLevel(wall) ? moveWallEnds(wall, from, to) : wall));
  const moved = new Set(walls.filter((wall, index) => wall !== plan.walls[index]).map((wall) => wall.id));
  // Each opening is re-projected onto its own wall only, so it keeps its place instead of jumping to a neighbour
  const openings = plan.openings.flatMap((opening) =>
    moved.has(opening.wallId) ? reattachOpenings([opening], plan.walls, walls.filter((wall) => wall.id === opening.wallId), plan.meta.scale) : [opening],
  );
  return {
    ...plan,
    walls,
    openings,
    columns: plan.columns.map((column) => (onLevel(column) && same(column, from) ? { ...column, ...to } : column)),
    rooms: plan.rooms.map((room) => (onLevel(room) ? { ...room, polygon: room.polygon.map((point) => (same(point, from) ? to : point)) } : room)),
  };
}

// Typing a length keeps the wall start and its direction and moves the end vertex
export function setWallLength(plan: FloorPlan, id: string, meters: number): FloorPlan {
  const wall = plan.walls.find((item) => item.id === id);
  const axis = wall && wallAxis(wall);
  if (!wall || !axis || meters <= 0) return plan;
  return moveVertex(plan, wall.level, { x: wall.x2, y: wall.y2 }, pointAlong(axis, meters / plan.meta.scale));
}

export type SnapSettings = { gridStep: number; tolerance: number; angleTolerance: number };

function oppositeEnd(plan: FloorPlan, level: number, point: Point): Point | undefined {
  const wall = plan.walls.find((item) => item.level === level && (same({ x: item.x1, y: item.y1 }, point) || same({ x: item.x2, y: item.y2 }, point)));
  if (!wall) return undefined;
  return same({ x: wall.x1, y: wall.y1 }, point) ? { x: wall.x2, y: wall.y2 } : { x: wall.x1, y: wall.y1 };
}

// Dragging snaps to the other vertices, keeps the wall square to its far end and lands on the grid
export function dragVertex(plan: FloorPlan, level: number, from: Point, raw: Point, settings: SnapSettings): FloorPlan {
  const vertices = planVertices(plan, level).map((vertex) => vertex.point).filter((point) => !same(point, from));
  const to = snapEditPoint(raw, { anchor: oppositeEnd(plan, level, from), vertices, gridStep: settings.gridStep, vertexTolerance: settings.tolerance, angleTolerance: settings.angleTolerance });
  return moveVertex(plan, level, from, to);
}
