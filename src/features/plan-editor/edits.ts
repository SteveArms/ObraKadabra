import { WALL_THICKNESS_BY_KIND, DEFAULT_OPENING } from "@/data/structure";
import type { Column, FloorPlan, Opening, Room, Wall, WallKind } from "@/schemas/floor-plan";
import type { ElementRef } from "./types";

type Element = Wall | Opening | Column | Room;

const LISTS = { wall: "walls", opening: "openings", column: "columns", room: "rooms" } as const;

export function findElement(plan: FloorPlan, ref: ElementRef): Element | undefined {
  const list: Element[] = plan[LISTS[ref.type]];
  return list.find((item) => item.id === ref.id);
}

function patchList<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function patchWall(plan: FloorPlan, id: string, patch: Partial<Wall>): FloorPlan {
  return { ...plan, walls: patchList(plan.walls, id, patch) };
}

export function patchOpening(plan: FloorPlan, id: string, patch: Partial<Opening>): FloorPlan {
  return { ...plan, openings: patchList(plan.openings, id, patch) };
}

export function patchColumn(plan: FloorPlan, id: string, patch: Partial<Column>): FloorPlan {
  return { ...plan, columns: patchList(plan.columns, id, patch) };
}

export function patchRoom(plan: FloorPlan, id: string, patch: Partial<Room>): FloorPlan {
  return { ...plan, rooms: patchList(plan.rooms, id, patch) };
}

// Answering the type question also confirms the element, since the user has now looked at it
export function setWallKind(plan: FloorPlan, id: string, kind: WallKind): FloorPlan {
  return patchWall(plan, id, { kind, thickness: WALL_THICKNESS_BY_KIND[kind], confidence: 1 });
}

export function setOpeningKind(plan: FloorPlan, id: string, kind: Opening["kind"]): FloorPlan {
  return patchOpening(plan, id, { kind, ...DEFAULT_OPENING[kind], confidence: 1 });
}

export function confirmElement(plan: FloorPlan, ref: ElementRef): FloorPlan {
  if (ref.type === "wall") return patchWall(plan, ref.id, { confidence: 1 });
  if (ref.type === "opening") return patchOpening(plan, ref.id, { confidence: 1 });
  if (ref.type === "column") return patchColumn(plan, ref.id, { confidence: 1 });
  return patchRoom(plan, ref.id, { confidence: 1 });
}

// A wall takes its doors and windows with it
export function removeElement(plan: FloorPlan, ref: ElementRef): FloorPlan {
  const keep = <T extends { id: string }>(items: T[]) => items.filter((item) => item.id !== ref.id);
  if (ref.type === "wall") return { ...plan, walls: keep(plan.walls), openings: plan.openings.filter((opening) => opening.wallId !== ref.id) };
  if (ref.type === "opening") return { ...plan, openings: keep(plan.openings) };
  if (ref.type === "column") return { ...plan, columns: keep(plan.columns) };
  return { ...plan, rooms: keep(plan.rooms) };
}
