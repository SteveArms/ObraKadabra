import { describe, expect, it } from "vitest";
import { snapAngle, snapToGrid } from "./snap";
import { makeWall } from "./test-helpers";

describe("snapToGrid", () => {
  it("rounds to the nearest grid step", () => {
    expect(snapToGrid(1.26, 0.05)).toBeCloseTo(1.25);
    expect(snapToGrid(7, 5)).toBe(5);
    expect(snapToGrid(3.3, 0)).toBe(3.3);
  });
});

describe("snapAngle", () => {
  it("snaps a nearly horizontal wall and keeps its length", () => {
    const snapped = snapAngle(makeWall("M-1", 0, 0, 100, 3), 3);
    expect(snapped.y2).toBe(0);
    expect(snapped.x2).toBeCloseTo(Math.hypot(100, 3));
  });

  it("snaps a nearly vertical wall going up", () => {
    const snapped = snapAngle(makeWall("M-1", 10, 10, 12, -90), 3);
    expect(snapped.x2).toBe(10);
    expect(snapped.y2).toBeLessThan(10);
  });

  it("leaves diagonal walls outside the tolerance untouched", () => {
    const wall = makeWall("M-1", 0, 0, 100, 20);
    expect(snapAngle(wall, 3)).toBe(wall);
  });
});
