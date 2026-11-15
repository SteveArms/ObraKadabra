import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import { scheduleFor } from "@/lib/schedule";
import { activityAt, activityState, todayWeek, weekFromRatio } from "./utils";

const schedule = scheduleFor(DEMO_PROJECTS[0].floorPlan);

describe("schedule utils", () => {
  it("counts calendar weeks from the start date", () => {
    const now = new Date("2026-11-14T12:00:00").getTime();
    expect(todayWeek("2026-10-05", 10, now)).toBe(6);
    expect(todayWeek("2027-01-01", 10, now)).toBe(1);
    expect(todayWeek("2025-01-01", 10, now)).toBe(10);
    expect(todayWeek(undefined, 10, now)).toBeUndefined();
  });

  it("finds the activity at a week and classifies it", () => {
    expect(activityAt(schedule, 1)?.stage).toBe("foundation");
    expect(activityState(schedule.activities[0], 1)).toBe("active");
    expect(activityState(schedule.activities.at(-1)!, 1)).toBe("future");
    expect(activityState(schedule.activities[0], schedule.totalWeeks)).toBe("done");
  });

  it("maps a position on the track to a week", () => {
    expect(weekFromRatio(0, schedule)).toBe(1);
    expect(weekFromRatio(1, schedule)).toBe(schedule.totalWeeks);
    expect(weekFromRatio(0.5, schedule)).toBeGreaterThan(1);
  });
});
