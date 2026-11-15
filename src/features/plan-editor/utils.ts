import { distanceToSegment, openingSegment, polygonCentroid, wallAxis } from "@/lib/geometry";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import type { Bounds, ElementRef } from "./types";

export function sameRef(a?: ElementRef, b?: ElementRef): boolean {
  return Boolean(a && b && a.type === b.type && a.id === b.id);
}

// Review follows pendingElements (least confident first) and wraps around after the current selection
export function nextPending(pending: PendingElement[], current?: ElementRef): ElementRef | undefined {
  if (pending.length === 0) return undefined;
  const index = pending.findIndex((item) => sameRef(item, current));
  const next = pending[(index + 1) % pending.length];
  return { type: next.type, id: next.id };
}

export function elementLevel(plan: FloorPlan, ref: ElementRef): number | undefined {
  if (ref.type === "opening") {
    const opening = plan.openings.find((item) => item.id === ref.id);
    return plan.walls.find((wall) => wall.id === opening?.wallId)?.level;
  }
  const list = ref.type === "wall" ? plan.walls : ref.type === "column" ? plan.columns : plan.rooms;
  return list.find((item) => item.id === ref.id)?.level;
}

// The point a badge or the decision popover points at, in plan units
export function elementAnchor(plan: FloorPlan, ref: ElementRef): Point | undefined {
  if (ref.type === "wall") {
    const wall = plan.walls.find((item) => item.id === ref.id);
    return wall && { x: (wall.x1 + wall.x2) / 2, y: (wall.y1 + wall.y2) / 2 };
  }
  if (ref.type === "opening") {
    const opening = plan.openings.find((item) => item.id === ref.id);
    const wall = plan.walls.find((item) => item.id === opening?.wallId);
    const cut = opening && wall && openingSegment(wall, opening, plan.meta.scale);
    return cut ? { x: (cut.start.x + cut.end.x) / 2, y: (cut.start.y + cut.end.y) / 2 } : undefined;
  }
  if (ref.type === "column") return plan.columns.find((item) => item.id === ref.id);
  const room = plan.rooms.find((item) => item.id === ref.id);
  return room && polygonCentroid(room.polygon);
}

// Without a photo the canvas frames the drawing with a margin of a tenth of its size (at least one meter)
export function planBounds(plan: FloorPlan, level: number, image?: { width: number; height: number }): Bounds {
  if (image) return { x: 0, y: 0, w: image.width, h: image.height };
  const points = [
    ...plan.walls.filter((wall) => wall.level === level).flatMap((wall) => [{ x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 }]),
    ...plan.columns.filter((column) => column.level === level),
    ...plan.rooms.filter((room) => room.level === level).flatMap((room) => room.polygon),
  ];
  const unit = 1 / plan.meta.scale;
  if (points.length === 0) return { x: 0, y: 0, w: 10 * unit, h: 8 * unit };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const margin = Math.max(unit, (maxX - minX + maxY - minY) / 20);
  return { x: minX - margin, y: minY - margin, w: maxX - minX + 2 * margin, h: maxY - minY + 2 * margin };
}

// Columns standing on the wall line confine it; a load-bearing wall needs them at both ends
export function confiningColumns(plan: FloorPlan, wallId: string): string[] {
  const wall = plan.walls.find((item) => item.id === wallId);
  const axis = wall && wallAxis(wall);
  if (!wall || !axis) return [];
  return plan.columns
    .filter((column) => column.level === wall.level && distanceToSegment(column, axis) * plan.meta.scale <= Math.max(column.w, wall.thickness))
    .map((column) => column.id);
}
