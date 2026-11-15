"use client";

import { length, snapEditPoint } from "@/lib/geometry";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import { ANGLE_SNAP_DEG, GRID_METERS, SNAP_PX } from "../constants";
import { addColumn, addOpening, addRoom, addWall } from "../drawing";
import { removeElement } from "../edits";
import { useEditorStore } from "../store";
import type { ElementRef } from "../types";
import { planVertices, type SnapSettings } from "../vertices";

const editor = () => useEditorStore.getState();

// What a click does with each drawing tool; returns a short notice when the click could not be used
export function useToolActions(pixelsPerUnit: number) {
  const settings = (): SnapSettings => ({ gridStep: GRID_METERS / (editor().plan?.meta.scale ?? 1), tolerance: SNAP_PX / pixelsPerUnit, angleTolerance: ANGLE_SNAP_DEG });

  const snap = (raw: Point, anchor?: Point): Point => {
    const { plan, level } = editor();
    if (!plan) return raw;
    const { gridStep, tolerance, angleTolerance } = settings();
    return snapEditPoint(raw, { anchor, vertices: planVertices(plan, level).map((vertex) => vertex.point), gridStep, vertexTolerance: tolerance, angleTolerance });
  };

  const placed = (result: { plan: FloorPlan; id: string } | null, type: ElementRef["type"]) => {
    if (!result) return false;
    editor().commit(() => result.plan);
    editor().select({ type, id: result.id });
    return true;
  };

  const finishRoom = () => {
    const { plan, draft, level, setDraft } = editor();
    if (plan && draft.length >= 3) placed(addRoom(plan, draft, level), "room");
    setDraft([]);
  };

  const placeWallPoint = (point: Point) => {
    const { plan, draft, level, setDraft } = editor();
    const last = draft.at(-1);
    if (plan && last) placed(addWall(plan, last, point, level), "wall");
    setDraft([point]);
  };

  const placeRoomPoint = (point: Point) => {
    const { draft, setDraft } = editor();
    if (draft.length >= 3 && length(point, draft[0]) <= settings().tolerance) return finishRoom();
    setDraft([...draft, point]);
  };

  const placeOpening = (kind: "door" | "window", raw: Point, target?: ElementRef): string | null => {
    const { plan } = editor();
    if (!plan || target?.type !== "wall") return `Click a wall to place the ${kind}.`;
    return placed(addOpening(plan, target.id, kind, raw), "opening") ? null : `Wall ${target.id} is too short for a ${kind}.`;
  };

  const placeColumn = (raw: Point) => {
    const { plan, level } = editor();
    if (plan) placed(addColumn(plan, snap(raw), level), "column");
  };

  const remove = (target?: ElementRef): string | null => {
    if (!target) return "Click an element to delete it.";
    editor().commit((plan) => removeElement(plan, target));
    editor().select(undefined);
    return null;
  };

  const placePair = (point: Point) => {
    const { draft, setDraft } = editor();
    setDraft(draft.length >= 2 ? [point] : [...draft, point]);
  };

  return { settings, snap, finishRoom, placeWallPoint, placeRoomPoint, placeOpening, placeColumn, remove, placePair };
}
