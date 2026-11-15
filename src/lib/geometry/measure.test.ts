import { describe, expect, it } from "vitest";
import type { Opening } from "@/schemas/floor-plan";
import { area, length, polygonArea, volume, wallArea, wallLength } from "./measure";
import { makeWall } from "./test-helpers";

describe("measure", () => {
  it("computes length, area and volume", () => {
    expect(length({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(wallLength(makeWall("M-1", 0, 0, 0, 6))).toBe(6);
    expect(area(2, 3)).toBe(6);
    expect(volume(0.25, 0.25, 2.6)).toBeCloseTo(0.1625);
  });

  it("computes polygon area regardless of vertex order", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 9, y: 0 },
      { x: 9, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonArea(square)).toBe(90);
    expect(polygonArea([...square].reverse())).toBe(90);
    expect(polygonArea(square.slice(0, 2))).toBe(0);
  });

  it("subtracts the openings of the same wall from its area", () => {
    const wall = makeWall("M-1", 0, 0, 100, 0);
    const openings: Opening[] = [
      { id: "P-1", wallId: "M-1", kind: "door", offset: 1, width: 0.9, height: 2.1, sill: 0 },
      { id: "V-1", wallId: "M-2", kind: "window", offset: 1, width: 1.5, height: 1.2, sill: 0.9 },
    ];
    expect(wallArea(wall, 2.5, openings, 0.05)).toBeCloseTo(5 * 2.5 - 0.9 * 2.1);
  });

  it("never returns a negative wall area", () => {
    const wall = makeWall("M-1", 0, 0, 1, 0);
    const door: Opening = { id: "P-1", wallId: "M-1", kind: "door", offset: 0, width: 2, height: 2.4, sill: 0 };
    expect(wallArea(wall, 2.4, [door])).toBe(0);
  });
});
