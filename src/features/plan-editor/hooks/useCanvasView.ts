"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useElementSize, type Size } from "@/lib/hooks/useElementSize";
import type { Point } from "@/schemas/floor-plan";
import { FRAME_INSETS, ZOOM_LIMITS } from "../constants";
import type { Bounds } from "../types";

type View = { x: number; y: number; zoom: number };
type Frame = { fit: number; origin: Point };

const clampZoom = (zoom: number) => Math.min(Math.max(zoom, ZOOM_LIMITS.min), ZOOM_LIMITS.max);

function frame(size: Size, bounds: Bounds): Frame {
  const width = Math.max(size.width - FRAME_INSETS.left - FRAME_INSETS.right, 1);
  const height = Math.max(size.height - FRAME_INSETS.top - FRAME_INSETS.bottom, 1);
  const fit = size.width && size.height ? Math.min(width / bounds.w, height / bounds.h) : 0;
  return {
    fit,
    origin: { x: FRAME_INSETS.left + (width - bounds.w * fit) / 2 - bounds.x * fit, y: FRAME_INSETS.top + (height - bounds.h * fit) / 2 - bounds.y * fit },
  };
}

// Zooming keeps the plan point under the anchor (cursor or centre) where it is on screen
function zoomedView(previous: View, factor: number, anchor: Point, current: Frame): View {
  const zoom = clampZoom(previous.zoom * factor);
  const pan = (axis: "x" | "y") => {
    const local = (anchor[axis] - current.origin[axis]) / current.fit;
    return local - (local - previous[axis]) * (zoom / previous.zoom);
  };
  return { x: pan("x"), y: pan("y"), zoom };
}

function centeredView(previous: View, point: Point, size: Size, current: Frame): View {
  const target = (axis: "x" | "y", middle: number) => (middle - current.origin[axis]) / current.fit;
  return { ...previous, x: target("x", size.width / 2) - previous.zoom * point.x, y: target("y", size.height / 2) - previous.zoom * point.y };
}

// The wheel listener must be non-passive to stop the page from scrolling while zooming the plan
function useWheelZoom(ref: RefObject<HTMLDivElement | null>, zoomAt: (factor: number, at?: Point) => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const box = element.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 1.1 : 1 / 1.1, { x: event.clientX - box.left, y: event.clientY - box.top });
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref, zoomAt]);
}

function projector(ref: RefObject<HTMLDivElement | null>, translate: Point, scale: number) {
  return {
    toPlan: (clientX: number, clientY: number): Point => {
      const box = ref.current?.getBoundingClientRect();
      return { x: (clientX - (box?.left ?? 0) - translate.x) / scale, y: (clientY - (box?.top ?? 0) - translate.y) / scale };
    },
    toScreen: (point: Point): Point => ({ x: translate.x + point.x * scale, y: translate.y + point.y * scale }),
  };
}

// Plan units (photo pixels) to canvas pixels: the bounds fit the box at zoom 1, then pan and zoom apply on top
export function useCanvasView(ref: RefObject<HTMLDivElement | null>, bounds: Bounds) {
  const size = useElementSize(ref);
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const { fit, origin } = frame(size, bounds);
  const scale = fit * view.zoom;
  const translate = { x: origin.x + fit * view.x, y: origin.y + fit * view.y };

  const zoomAt = useCallback(
    (factor: number, at?: Point) => {
      const current = frame(size, bounds);
      if (current.fit) setView((previous) => zoomedView(previous, factor, at ?? { x: size.width / 2, y: size.height / 2 }, current));
    },
    [size, bounds],
  );
  const centerOn = useCallback(
    (point: Point) => {
      const current = frame(size, bounds);
      if (current.fit) setView((previous) => centeredView(previous, point, size, current));
    },
    [size, bounds],
  );
  useWheelZoom(ref, zoomAt);

  return {
    size,
    ready: fit > 0,
    scale,
    zoom: view.zoom,
    transform: `translate(${translate.x} ${translate.y}) scale(${scale})`,
    ...projector(ref, translate, scale),
    zoomAt,
    centerOn,
    panBy: (dx: number, dy: number) => fit && setView((current) => ({ ...current, x: current.x + dx / fit, y: current.y + dy / fit })),
    reset: () => setView({ x: 0, y: 0, zoom: 1 }),
  };
}

export type CanvasView = ReturnType<typeof useCanvasView>;
