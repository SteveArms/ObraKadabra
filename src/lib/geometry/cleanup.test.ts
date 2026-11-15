import { describe, expect, it } from "vitest";
import { closeGaps, mergeCollinear } from "./cleanup";
import { makeWall } from "./test-helpers";

describe("mergeCollinear", () => {
  it("merges touching collinear walls into one", () => {
    const merged = mergeCollinear([makeWall("M-1", 0, 0, 4, 0), makeWall("M-2", 4, 0, 9, 0)], 0.01);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ id: "M-1", x1: 0, y1: 0, x2: 9, y2: 0 });
  });

  it("merges overlapping walls drawn in opposite directions", () => {
    const merged = mergeCollinear([makeWall("M-1", 0, 0, 5, 0), makeWall("M-2", 9, 0, 3, 0)], 0.01);
    expect(merged).toHaveLength(1);
    expect(merged[0].x2).toBeCloseTo(9);
  });

  it("keeps parallel, separated or different walls apart", () => {
    const walls = [
      makeWall("M-1", 0, 0, 4, 0),
      makeWall("M-2", 0, 1, 4, 1),
      makeWall("M-3", 5, 0, 9, 0),
      makeWall("M-4", 4, 0, 4, 5, { kind: "partition" }),
    ];
    expect(mergeCollinear(walls, 0.01)).toHaveLength(4);
  });
});

describe("closeGaps", () => {
  it("joins endpoints closer than the tolerance", () => {
    const closed = closeGaps([makeWall("M-1", 0, 0, 4, 0), makeWall("M-2", 4.03, 0.02, 4, 5)], 0.05);
    expect(closed[1]).toMatchObject({ x1: 4, y1: 0 });
  });

  it("leaves distant endpoints alone", () => {
    const closed = closeGaps([makeWall("M-1", 0, 0, 4, 0), makeWall("M-2", 4.5, 0, 4.5, 5)], 0.05);
    expect(closed[1]).toMatchObject({ x1: 4.5, y1: 0 });
  });
});
