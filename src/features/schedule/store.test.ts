import { beforeEach, describe, expect, it } from "vitest";
import { useTimeline } from "./store";

describe("useTimeline", () => {
  beforeEach(() => useTimeline.getState().reset(10, 4));

  it("starts on today's week and clamps every move to the schedule", () => {
    expect(useTimeline.getState().week).toBe(4);
    useTimeline.getState().step(20);
    expect(useTimeline.getState().week).toBe(10);
    useTimeline.getState().setWeek(-3);
    expect(useTimeline.getState().week).toBe(1);
  });

  it("restarts from week 1 when playing at the end", () => {
    useTimeline.getState().setWeek(10);
    useTimeline.getState().play();
    expect(useTimeline.getState()).toMatchObject({ playing: true, week: 1 });
    useTimeline.getState().pause();
    expect(useTimeline.getState().playing).toBe(false);
  });

  it("starts on week 1 without a start date", () => {
    useTimeline.getState().reset(6);
    expect(useTimeline.getState().week).toBe(1);
  });
});
