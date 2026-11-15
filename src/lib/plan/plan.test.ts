import { describe, expect, it } from "vitest";
import { makeWall } from "@/lib/geometry/test-helpers";
import { FloorPlanSchema } from "@/schemas/floor-plan";
import type { LevelPlan } from "@/schemas/plan-extraction";
import { assemblePlan, mergeLevels, numberElements, pendingElements } from "./index";

const square = [
  makeWall("a", 0, 0, 800, 0),
  makeWall("b", 800, 0, 800, 600),
  makeWall("c", 800, 600, 0, 600, { confidence: 0.6 }),
  makeWall("d", 0, 600, 0, 0),
];

const groundFloor: LevelPlan = {
  level: 1,
  scale: 0.01,
  walls: square,
  openings: [{ id: "x", wallId: "a", kind: "door", offset: 1, width: 0.9, height: 2.1, sill: 0, confidence: 0.9 }],
  columns: [{ id: "k", x: 0, y: 0, w: 0.25, d: 0.25, level: 1, confidence: 0.7 }],
  rooms: [{ id: "r", name: "Living room", level: 1, confidence: 0.95, polygon: [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 600 }] }],
};

const details = { name: "Test home", levels: 2, floorHeight: 2.6, roofType: "concrete_slab" as const };

describe("pendingElements", () => {
  it("lists elements under 0.75, least confident first, and ignores missing confidence", () => {
    const pending = pendingElements({ ...groundFloor, rooms: [{ ...groundFloor.rooms[0], confidence: undefined }] });
    expect(pending).toEqual([
      { type: "wall", id: "c", confidence: 0.6 },
      { type: "column", id: "k", confidence: 0.7 },
    ]);
  });
});

describe("numberElements", () => {
  it("names elements by floor and keeps openings on their renamed wall", () => {
    const numbered = numberElements({ ...groundFloor, level: 2 });
    expect(numbered.walls.map((wall) => wall.id)).toEqual(["M-201", "M-202", "M-203", "M-204"]);
    expect(numbered.openings[0]).toMatchObject({ id: "P-201", wallId: "M-201" });
    expect(numbered.columns[0].level).toBe(2);
  });
});

describe("mergeLevels", () => {
  it("rescales a floor photographed at another scale into the first floor's pixels", () => {
    const upper: LevelPlan = { ...numberElements({ ...groundFloor, level: 2 }), scale: 0.02, walls: [makeWall("M-201", 0, 0, 400, 0, { level: 2 })] };
    const merged = mergeLevels([numberElements(groundFloor), upper], 2);
    expect(merged.scale).toBe(0.01);
    expect(merged.walls.find((wall) => wall.id === "M-201")?.x2).toBe(800);
  });

  it("repeats the floor below when there is no photo for an upper floor", () => {
    const merged = mergeLevels([numberElements(groundFloor)], 2);
    expect(merged.walls).toHaveLength(8);
    expect(merged.walls.filter((wall) => wall.level === 2).map((wall) => wall.id)[0]).toBe("M-201");
  });
});

describe("assemblePlan", () => {
  it("builds a valid FloorPlan with footings, a slab per lower floor and a roof on top", () => {
    const plan = assemblePlan([numberElements(groundFloor)], details);
    expect(FloorPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.meta.scale).toBe(0.01);
    expect(plan.footings).toHaveLength(1);
    expect(plan.slabs.map((slab) => slab.level)).toEqual([1]);
    expect(plan.roofs.map((roof) => roof.level)).toEqual([2]);
  });
});
