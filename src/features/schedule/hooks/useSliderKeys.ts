"use client";

import type { KeyboardEvent } from "react";
import { useTimeline } from "../store";

const KEY_STEPS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 4, PageDown: -4 };

// ARIA slider keys: arrows move a week, Page keys four, Home and End jump to the ends
export function useSliderKeys() {
  const { week, totalWeeks, step, pause } = useTimeline();
  return (event: KeyboardEvent) => {
    const jump = event.key === "Home" ? 1 - week : event.key === "End" ? totalWeeks - week : KEY_STEPS[event.key];
    if (jump === undefined) return;
    event.preventDefault();
    pause();
    step(jump);
  };
}
