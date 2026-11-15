"use client";

import { useEffect } from "react";
import { useTimeline } from "../store";

const WEEK_MS_AT_1X = 1000;

// Advances one week per tick while playing and stops on the last week
export function usePlayback(): void {
  const playing = useTimeline((state) => state.playing);
  const speed = useTimeline((state) => state.speed);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const { week, totalWeeks, step, pause } = useTimeline.getState();
      if (week >= totalWeeks) return pause();
      step(1);
    }, WEEK_MS_AT_1X / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed]);
}
