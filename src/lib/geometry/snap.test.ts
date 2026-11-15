import { describe, expect, it } from "vitest";
import { snapAngle, snapEditPoint, snapToGrid, snapToPoint } from "./snap";
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

describe("snapToPoint", () => {
  it("picks the closest candidate inside the tolerance", () => {
    expect(snapToPoint({ x: 10, y: 10 }, [{ x: 30, y: 10 }, { x: 13, y: 9 }], 5)).toEqual({ x: 13, y: 9 });
    expect(snapToPoint({ x: 10, y: 10 }, [{ x: 30, y: 10 }], 5)).toBeNull();
  });
});

describe("snapEditPoint", () => {
  const options = { vertices: [{ x: 500, y: 720 }], gridStep: 5, vertexTolerance: 8, angleTolerance: 5 };

  it("prefers a nearby vertex over the grid", () => {
    expect(snapEditPoint({ x: 504, y: 716 }, options)).toEqual({ x: 500, y: 720 });
  });

  it("locks a nearly vertical segment to its anchor and rounds the free axis to the grid", () => {
    expect(snapEditPoint({ x: 503, y: 597 }, { ...options, anchor: { x: 500, y: 120 } })).toEqual({ x: 500, y: 595 });
  });

  it("only rounds to the grid when the segment is clearly diagonal", () => {
    expect(snapEditPoint({ x: 612, y: 433 }, { ...options, anchor: { x: 500, y: 300 } })).toEqual({ x: 610, y: 435 });
  });
});
