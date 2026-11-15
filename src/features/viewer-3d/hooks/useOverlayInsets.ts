"use client";

import { useEffect, type RefObject } from "react";
import { useViewerStore } from "../store";

// Measures how much of the canvas the top and bottom overlays cover, so the camera frames the house in the free band
export function useOverlayInsets(top: RefObject<HTMLElement | null>, bottom: RefObject<HTMLElement | null>): void {
  const setInsets = useViewerStore((state) => state.setInsets);

  useEffect(() => {
    const container = top.current?.closest<HTMLElement>("[data-testid='viewer']");
    if (!container || !top.current || !bottom.current) return;
    const measure = () => {
      const box = container.getBoundingClientRect();
      const topBox = top.current!.getBoundingClientRect();
      const bottomBox = bottom.current!.getBoundingClientRect();
      const insets = { top: Math.round(topBox.bottom - box.top), bottom: Math.round(box.bottom - bottomBox.top) };
      const current = useViewerStore.getState().insets;
      if (current.top !== insets.top || current.bottom !== insets.bottom) setInsets(insets);
    };
    const observer = new ResizeObserver(measure);
    [container, top.current, bottom.current].forEach((element) => observer.observe(element));
    measure();
    return () => observer.disconnect();
  }, [top, bottom, setInsets]);
}
