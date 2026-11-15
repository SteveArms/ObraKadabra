"use client";

import { useEffect } from "react";
import type { ElementStatus } from "@/schemas/schedule";
import { useViewerStore, type ViewerTimeline } from "../store";

// Lets the workspace drive element visibility and colors from the schedule without knowing the viewer store
export function useViewerTimeline(timeline: ViewerTimeline | undefined, statuses: Record<string, ElementStatus>): void {
  const setTimeline = useViewerStore((state) => state.setTimeline);
  useEffect(() => setTimeline(timeline, statuses), [timeline, statuses, setTimeline]);
}
