"use client";

import { useShallow } from "zustand/react/shallow";
import { useTimeline } from "../store";

// One source for play, pause and week stepping, used by the full timeline and by the player inside the viewer
export function usePlaybackControls() {
  const { week, totalWeeks, playing, step, play, pause } = useTimeline(
    useShallow(({ week, totalWeeks, playing, step, play, pause }) => ({ week, totalWeeks, playing, step, play, pause })),
  );
  return {
    week,
    totalWeeks,
    playing,
    canGoBack: week > 1,
    canGoForward: week < totalWeeks,
    previous: () => step(-1),
    next: () => step(1),
    toggle: playing ? pause : play,
  };
}
