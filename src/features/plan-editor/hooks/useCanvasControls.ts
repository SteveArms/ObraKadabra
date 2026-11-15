"use client";

import { useEffect, useMemo } from "react";
import { ZOOM_LIMITS } from "../constants";
import { useEditorStore } from "../store";
import type { useCanvasPointer } from "./useCanvasPointer";
import type { CanvasView } from "./useCanvasView";
import { useEditorShortcuts } from "./useEditorShortcuts";

// Connects the canvas to the keyboard and lets Review next (outside the canvas) bring an element into view
export function useCanvasControls(view: CanvasView, pointer: ReturnType<typeof useCanvasPointer>) {
  const { cancel, finish } = pointer;
  const { zoomAt, reset, centerOn } = view;
  const actions = useMemo(() => ({ cancel, finish, zoomIn: () => zoomAt(ZOOM_LIMITS.step), zoomOut: () => zoomAt(1 / ZOOM_LIMITS.step), fit: reset }), [cancel, finish, zoomAt, reset]);
  useEditorShortcuts(actions);

  useEffect(() => {
    useEditorStore.getState().setCenterOn(centerOn);
    return () => useEditorStore.getState().setCenterOn(undefined);
  }, [centerOn]);
}
