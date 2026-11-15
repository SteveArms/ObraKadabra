"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { Point } from "@/schemas/floor-plan";
import { FRAME_INSETS, ZOOM_LIMITS } from "../constants";
import type { Bounds } from "../types";

type View = { x: number; y: number; zoom: number };
type Size = { width: number; height: number };

const clampZoom = (zoom: number) => Math.min(Math.max(zoom, ZOOM_LIMITS.min), ZOOM_LIMITS.max);

function frame(size: Size, bounds: Bounds) {
  const width = Math.max(size.width - FRAME_INSETS.left - FRAME_INSETS.right, 1);
  const height = Math.max(size.height - FRAME_INSETS.top - FRAME_INSETS.bottom, 1);
  const fit = size.width && size.height ? Math.min(width / bounds.w, height / bounds.h) : 0;
  return {
    fit,
    origin: { x: FRAME_INSETS.left + (width - bounds.w * fit) / 2 - bounds.x * fit, y: FRAME_INSETS.top + (height - bounds.h * fit) / 2 - bounds.y * fit },
  };
}

// Plan units (photo pixels) to canvas pixels: the bounds fit the box at zoom 1, then pan and zoom apply on top
export function useCanvasView(ref: RefObject<HTMLDivElement | null>, bounds: Bounds) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const { fit, origin } = frame(size, bounds);
  const scale = fit * view.zoom;
  const translate = { x: origin.x + fit * view.x, y: origin.y + fit * view.y };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  const zoomAt = useCallback(
    (factor: number, at?: Point) => {
      const current = frame(size, bounds);
      if (!current.fit) return;
      const anchor = at ?? { x: size.width / 2, y: size.height / 2 };
      setView((previous) => {
        const zoom = clampZoom(previous.zoom * factor);
        const pan = (axis: "x" | "y") => {
          const local = (anchor[axis] - current.origin[axis]) / current.fit;
          return local - (local - previous[axis]) * (zoom / previous.zoom);
        };
        return { x: pan("x"), y: pan("y"), zoom };
      });
    },
    [size, bounds],
  );

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

  const toPlan = (clientX: number, clientY: number): Point => {
    const box = ref.current?.getBoundingClientRect();
    return { x: (clientX - (box?.left ?? 0) - translate.x) / scale, y: (clientY - (box?.top ?? 0) - translate.y) / scale };
  };

  const centerOn = useCallback(
    (point: Point) => {
      const current = frame(size, bounds);
      if (!current.fit) return;
      const target = (axis: "x" | "y", middle: number) => (middle - current.origin[axis]) / current.fit;
      setView((previous) => ({ ...previous, x: target("x", size.width / 2) - previous.zoom * point.x, y: target("y", size.height / 2) - previous.zoom * point.y }));
    },
    [size, bounds],
  );

  return {
    size,
    ready: fit > 0,
    scale,
    zoom: view.zoom,
    transform: `translate(${translate.x} ${translate.y}) scale(${scale})`,
    toPlan,
    toScreen: (point: Point): Point => ({ x: translate.x + point.x * scale, y: translate.y + point.y * scale }),
    zoomAt,
    centerOn,
    panBy: (dx: number, dy: number) => fit && setView((current) => ({ ...current, x: current.x + dx / fit, y: current.y + dy / fit })),
    reset: () => setView({ x: 0, y: 0, zoom: 1 }),
  };
}

export type CanvasView = ReturnType<typeof useCanvasView>;
