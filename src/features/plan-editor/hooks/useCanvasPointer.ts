"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import { useEditorStore } from "../store";
import type { ElementRef, Tool } from "../types";
import { dragVertex } from "../vertices";
import type { CanvasView } from "./useCanvasView";
import { useToolActions } from "./useToolActions";

type Drag = { kind: "vertex"; from: Point; start: FloorPlan; moved: boolean } | { kind: "pan"; x: number; y: number };
type Hit = { vertex?: Point; target?: ElementRef };

const ELEMENT_TYPES: ElementRef["type"][] = ["wall", "opening", "column", "room"];
const TRACKING_TOOLS: Tool[] = ["wall", "room", "measure", "calibrate", "column"];
const editor = () => useEditorStore.getState();

function hitTest(target: EventTarget): Hit {
  if (!(target instanceof Element)) return {};
  const handle = target.closest<SVGElement>("[data-vertex-x]");
  const shape = target.closest<SVGElement>("[data-element-id]");
  const type = shape?.dataset.elementType as ElementRef["type"] | undefined;
  return {
    vertex: handle ? { x: Number(handle.dataset.vertexX), y: Number(handle.dataset.vertexY) } : undefined,
    target: shape?.dataset.elementId && type && ELEMENT_TYPES.includes(type) ? { type, id: shape.dataset.elementId } : undefined,
  };
}

type ToolActions = ReturnType<typeof useToolActions>;

// A click with a placing tool: returns a notice when the click could not do anything
function applyClick(actions: ToolActions, tool: Tool, raw: Point, hit: Hit): string | null {
  if (tool === "delete") return actions.remove(hit.target);
  if (tool === "door" || tool === "window") return actions.placeOpening(tool, raw, hit.target);
  if (tool === "select") editor().select(hit.target);
  else if (tool === "column") actions.placeColumn(raw);
  if (tool === "select" || tool === "column") return null;
  const point = actions.snap(raw, editor().draft.at(-1));
  if (tool === "wall") actions.placeWallPoint(point);
  else if (tool === "room") actions.placeRoomPoint(point);
  else actions.placePair(point);
  return null;
}

function finishDrawing(actions: ToolActions) {
  if (editor().tool === "room") actions.finishRoom();
  else editor().setDraft([]);
}

// Select and Move vertex grab a corner, or pan when they press on empty plan; the middle button always pans
function beginDrag(event: PointerEvent<SVGSVGElement>, plan: FloorPlan, tool: Tool, hit: Hit): Drag | null {
  const pointing = tool === "select" || tool === "vertex";
  if (pointing && hit.vertex && event.button === 0) {
    editor().checkpoint();
    return { kind: "vertex", from: hit.vertex, start: plan, moved: false };
  }
  if (event.button !== 1 && !(pointing && !(tool === "select" && hit.target))) return null;
  if (tool === "select") editor().select(undefined);
  return { kind: "pan", x: event.clientX, y: event.clientY };
}

// A vertex press without movement leaves no empty undo step behind
function endDrag(drag: { current: Drag | null }) {
  if (drag.current?.kind === "vertex" && !drag.current.moved) editor().dropCheckpoint();
  drag.current = null;
}

function clearDraftOrSelection() {
  const { draft, setDraft, select } = editor();
  if (draft.length > 0) setDraft([]);
  else select(undefined);
}

// Select and Move vertex drag corners or pan the empty plan; every other tool places points with snapping
export function useCanvasPointer(view: CanvasView) {
  const drag = useRef<Drag | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const actions = useToolActions(view.scale);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const { plan, tool } = editor();
    if (!plan || event.button === 2) return;
    const hit = hitTest(event.target);
    setNotice(null);
    drag.current = beginDrag(event, plan, tool, hit);
    if (drag.current) event.currentTarget.setPointerCapture(event.pointerId);
    else setNotice(applyClick(actions, tool, view.toPlan(event.clientX, event.clientY), hit));
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const current = drag.current;
    const raw = view.toPlan(event.clientX, event.clientY);
    if (current?.kind === "vertex") {
      editor().preview(dragVertex(current.start, editor().level, current.from, raw, actions.settings()));
      current.moved = true;
    } else if (current?.kind === "pan") {
      view.panBy(event.clientX - current.x, event.clientY - current.y);
      drag.current = { kind: "pan", x: event.clientX, y: event.clientY };
    } else if (TRACKING_TOOLS.includes(editor().tool)) {
      editor().setCursor(actions.snap(raw, editor().tool === "column" ? undefined : editor().draft.at(-1)));
    }
  };

  const onPointerUp = () => endDrag(drag);

  const cancel = () => {
    clearDraftOrSelection();
    setNotice(null);
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: () => editor().setCursor(undefined), cancel, finish: () => finishDrawing(actions), notice };
}
