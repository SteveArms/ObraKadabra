import { describe, expect, it } from "vitest";
import type { Opening } from "@/schemas/floor-plan";
import { openingOffsetAt, openingSegment, reattachOpenings } from "./openings";
import { makeWall } from "./test-helpers";

const door: Opening = { id: "P-1", wallId: "M-2", kind: "door", offset: 1, width: 1, height: 2.1, sill: 0 };

describe("reattachOpenings", () => {
  it("keeps an opening whose wall did not change", () => {
    const walls = [makeWall("M-2", 0, 0, 400, 0)];
    expect(reattachOpenings([door], walls, walls, 0.01)).toEqual([door]);
  });

  it("moves an opening onto the wall that absorbed its own and recomputes the offset", () => {
    const before = [makeWall("M-1", 0, 0, 400, 0), makeWall("M-2", 400, 0, 800, 0)];
    const after = [makeWall("M-1", 0, 0, 800, 0)];
    const [moved] = reattachOpenings([door], before, after, 0.01);
    expect(moved.wallId).toBe("M-1");
    expect(moved.offset).toBeCloseTo(5);
  });

  it("drops an opening whose wall no longer exists anywhere near", () => {
    expect(reattachOpenings([{ ...door, wallId: "M-9" }], [makeWall("M-1", 0, 0, 1, 0)], [], 0.01)).toEqual([]);
  });

  it("clamps the opening inside a wall that became shorter", () => {
    const before = [makeWall("M-2", 0, 0, 400, 0)];
    const after = [makeWall("M-2", 0, 0, 150, 0)];
    const [moved] = reattachOpenings([{ ...door, offset: 3 }], before, after, 0.01);
    expect(moved.offset + moved.width).toBeLessThanOrEqual(1.5 + 1e-9);
  });
});

describe("opening placement", () => {
  const wall = makeWall("M-1", 100, 0, 500, 0);

  it("locates the cut on the wall in plan units", () => {
    expect(openingSegment(wall, { offset: 1, width: 0.9 }, 0.01)).toEqual({ start: { x: 200, y: 0 }, end: { x: 290, y: 0 } });
  });

  it("centers a new opening on the clicked point and keeps it inside the wall", () => {
    expect(openingOffsetAt(wall, { x: 300, y: 4 }, 1, 0.01)).toBeCloseTo(1.5);
    expect(openingOffsetAt(wall, { x: 102, y: 0 }, 1, 0.01)).toBe(0);
    expect(openingOffsetAt(wall, { x: 300, y: 0 }, 5, 0.01)).toBeNull();
  });
});
