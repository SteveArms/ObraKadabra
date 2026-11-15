import { polygonArea } from "@/lib/geometry";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import type { ExpectedElement, ProgressElementType, ProgressFinding } from "@/schemas/progress";
import type { Schedule, ScheduledTask } from "@/schemas/schedule";
import type { LevelChoice } from "./types";

const ORDINALS = ["First", "Second", "Third"];
const FLOOR_STAGES = ["foundation", "walls", "columns", "beams_slab"] as const;
// The AI only checks a manageable list: what is planned up to one week ahead
const LOOKAHEAD_WEEKS = 1;
const MAX_EXPECTED = 40;

export function levelChoices(levels: number): LevelChoice[] {
  const floors = Array.from({ length: levels }, (_, index): LevelChoice => ({
    id: `floor-${index + 1}`,
    label: ORDINALS[index] ? `${ORDINALS[index]} floor` : `Floor ${index + 1}`,
    level: index + 1,
    stages: [...FLOOR_STAGES],
  }));
  return [...floors, { id: "roof", label: "Roof", level: levels, stages: ["roof"] }];
}

function onChoice(task: ScheduledTask, choice: LevelChoice): boolean {
  if (!choice.stages.includes(task.stage)) return false;
  return task.stage === "foundation" ? choice.level === 1 : task.level === choice.level;
}

function taskPoints(plan: FloorPlan, task: ScheduledTask): Point[] {
  const wall = task.elementType === "wall" ? plan.walls.find((item) => item.id === task.elementId) : undefined;
  if (wall) return [{ x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 }, { x: (wall.x1 + wall.x2) / 2, y: (wall.y1 + wall.y2) / 2 }];
  const point = [...plan.columns, ...plan.footings].find((item) => item.id === task.elementId);
  return point ? [point] : [];
}

// Elements touching the room's outline, with a one-meter margin so its walls and corner columns count
function inRoom(plan: FloorPlan, task: ScheduledTask, roomId?: string): boolean {
  const room = plan.rooms.find((item) => item.id === roomId);
  if (!room || polygonArea(room.polygon) === 0) return true;
  const margin = 1 / plan.meta.scale;
  const xs = room.polygon.map((point) => point.x);
  const ys = room.polygon.map((point) => point.y);
  const points = taskPoints(plan, task);
  if (points.length === 0) return true;
  return points.some((p) => p.x >= Math.min(...xs) - margin && p.x <= Math.max(...xs) + margin && p.y >= Math.min(...ys) - margin && p.y <= Math.max(...ys) + margin);
}

// What the photo is checked against: elements of that floor planned up to next week and not yet reported finished
export function expectedElements(plan: FloorPlan, schedule: Schedule, week: number, choice: LevelChoice, roomId: string | undefined, finished: Set<string>): ExpectedElement[] {
  const candidates = schedule.tasks.filter((task) => task.meshKey && !finished.has(task.meshKey) && onChoice(task, choice) && task.startWeek <= week + LOOKAHEAD_WEEKS);
  const inSector = candidates.filter((task) => inRoom(plan, task, roomId));
  return (inSector.length > 0 ? inSector : candidates).slice(0, MAX_EXPECTED).map((task) => ({ id: task.elementId, type: task.meshKey!.split("_")[0] as ProgressElementType, stage: task.stage }));
}

// Only the elements a log talks about, so the small 3D view shows exactly what the photo shows
export function planForFindings(plan: FloorPlan, findings: Pick<ProgressFinding, "elementId" | "type">[]): FloorPlan {
  const ids = (type: ProgressElementType) => new Set(findings.filter((finding) => finding.type === type).map((finding) => finding.elementId));
  const [walls, columns, footings, slabs, roofs] = [ids("wall"), ids("column"), ids("footing"), ids("slab"), ids("roof")];
  return {
    ...plan,
    walls: plan.walls.filter((item) => walls.has(item.id)),
    openings: plan.openings.filter((item) => walls.has(item.wallId)),
    columns: plan.columns.filter((item) => columns.has(item.id)),
    footings: plan.footings.filter((item) => footings.has(item.id)),
    slabs: plan.slabs.filter((item) => slabs.has(item.id)),
    roofs: plan.roofs.filter((item) => roofs.has(item.id)),
    rooms: [],
  };
}
