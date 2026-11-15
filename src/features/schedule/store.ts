import { create } from "zustand";

export const PLAYBACK_SPEEDS = [1, 2, 5] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

type TimelineState = {
  week: number;
  totalWeeks: number;
  todayWeek?: number;
  playing: boolean;
  speed: PlaybackSpeed;
  reset: (totalWeeks: number, todayWeek?: number) => void;
  setWeek: (week: number) => void;
  step: (delta: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
};

function clamp(week: number, totalWeeks: number): number {
  return Math.min(Math.max(1, Math.round(week)), Math.max(1, totalWeeks));
}

// The current week shared by the timeline, the 3D viewer and every panel
export const useTimeline = create<TimelineState>((set, get) => ({
  week: 1,
  totalWeeks: 1,
  playing: false,
  speed: 1,
  reset: (totalWeeks, todayWeek) => set({ totalWeeks, todayWeek, week: clamp(todayWeek ?? 1, totalWeeks), playing: false }),
  setWeek: (week) => set({ week: clamp(week, get().totalWeeks) }),
  step: (delta) => set({ week: clamp(get().week + delta, get().totalWeeks) }),
  play: () => set(({ week, totalWeeks }) => ({ playing: true, week: week >= totalWeeks ? 1 : week })),
  pause: () => set({ playing: false }),
  setSpeed: (speed) => set({ speed }),
}));
