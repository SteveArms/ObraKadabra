import type { FloorPlan, Opening, Point } from "@/schemas/floor-plan";
import type { LevelPlan } from "@/schemas/plan-extraction";
import { ID_PREFIX, elementId } from "./ids";

export type PlanElements = Pick<FloorPlan, "walls" | "openings" | "columns" | "rooms">;

function numberOpenings(openings: Opening[], level: number, wallIds: Map<string, string>): Opening[] {
  const counters = { door: 0, window: 0 };
  return openings.flatMap((opening) => {
    const wallId = wallIds.get(opening.wallId);
    if (!wallId) return [];
    const index = counters[opening.kind]++;
    return [{ ...opening, wallId, id: elementId(ID_PREFIX[opening.kind], level, index) }];
  });
}

// Gives every element a stable id for its floor (M-1, M-201…) whatever the model or a copy called it
export function numberElements(plan: LevelPlan): LevelPlan {
  const { level } = plan;
  const wallIds = new Map(plan.walls.map((wall, index) => [wall.id, elementId(ID_PREFIX.wall, level, index)]));
  return {
    ...plan,
    walls: plan.walls.map((wall, index) => ({ ...wall, level, id: elementId(ID_PREFIX.wall, level, index) })),
    openings: numberOpenings(plan.openings, level, wallIds),
    columns: plan.columns.map((column, index) => ({ ...column, level, id: elementId(ID_PREFIX.column, level, index) })),
    rooms: plan.rooms.map((room, index) => ({ ...room, level, id: elementId(ID_PREFIX.room, level, index) })),
  };
}

// Expresses a floor drawn at another scale in the pixel units of the first floor
export function rescaleLevel(plan: LevelPlan, scale: number): LevelPlan {
  const factor = plan.scale / scale;
  const point = (p: Point): Point => ({ x: p.x * factor, y: p.y * factor });
  return {
    ...plan,
    scale,
    walls: plan.walls.map((wall) => ({ ...wall, x1: wall.x1 * factor, y1: wall.y1 * factor, x2: wall.x2 * factor, y2: wall.y2 * factor })),
    columns: plan.columns.map((column) => ({ ...column, ...point(column) })),
    rooms: plan.rooms.map((room) => ({ ...room, polygon: room.polygon.map(point) })),
  };
}

// Floors without their own photo repeat the closest floor below, the usual stacked layout of a self-built home
function fillLevels(plans: LevelPlan[], levels: number): LevelPlan[] {
  const result: LevelPlan[] = [];
  for (let level = 1; level <= levels; level++) {
    const own = plans.find((plan) => plan.level === level);
    const below = result.at(-1) ?? plans[0];
    result.push(own ?? numberElements({ ...below, level }));
  }
  return result;
}

export function mergeLevels(plans: LevelPlan[], levels: number): PlanElements & { scale: number } {
  const sorted = [...plans].sort((a, b) => a.level - b.level);
  if (sorted.length === 0) throw new Error("At least one floor plan is needed");
  const scale = sorted[0].scale;
  const filled = fillLevels(sorted.map((plan) => rescaleLevel(plan, scale)), Math.max(levels, sorted.at(-1)?.level ?? 1));
  return {
    scale,
    walls: filled.flatMap((plan) => plan.walls),
    openings: filled.flatMap((plan) => plan.openings),
    columns: filled.flatMap((plan) => plan.columns),
    rooms: filled.flatMap((plan) => plan.rooms),
  };
}
