import { describe, expect, it } from "vitest";
import { pendingElements } from "@/lib/plan";
import { addColumn, addOpening, addRoom, addWall } from "./drawing";
import { confirmElement, setOpeningKind } from "./edits";
import { makeFixturePlan } from "@/lib/ai/test-fixture";
import { confiningColumns, elementAnchor, nextPending, planBounds } from "./utils";
import { setWallLength } from "./vertices";

describe("drawing", () => {
  it("adds confirmed elements with the next free id", () => {
    const wall = addWall(makeFixturePlan(), { x: 100, y: 420 }, { x: 500, y: 420 }, 1);
    expect(wall?.id).toBe("M-7");
    expect(wall?.plan.walls.at(-1)).toMatchObject({ kind: "load_bearing", thickness: 0.25, confidence: 1 });
    expect(addWall(makeFixturePlan(), { x: 1, y: 1 }, { x: 1, y: 1 }, 1)).toBeNull();
    expect(addColumn(makeFixturePlan(), { x: 500, y: 420 }, 1).id).toBe("C-7");
    expect(addRoom(makeFixturePlan(), [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1)?.plan.rooms.at(-1)?.name).toBe("Room 4");
  });

  it("centers a new door on the clicked point of the wall", () => {
    const result = addOpening(makeFixturePlan(), "M-1", "door", { x: 700, y: 120 });
    expect(result?.id).toBe("P-4");
    expect(result?.plan.openings.at(-1)).toMatchObject({ wallId: "M-1", width: 0.9, sill: 0 });
    expect(result?.plan.openings.at(-1)?.offset).toBeCloseTo(5.55);
  });
});

describe("review", () => {
  it("walks the pending list in order and wraps around", () => {
    const pending = pendingElements(makeFixturePlan());
    expect(nextPending(pending)).toEqual({ type: "wall", id: "M-5" });
    expect(nextPending(pending, { type: "wall", id: "M-5" })).toEqual({ type: "opening", id: "V-2" });
    expect(nextPending(pending, { type: "column", id: "C-5" })).toEqual({ type: "wall", id: "M-5" });
    expect(nextPending([])).toBeUndefined();
  });

  it("confirms an element and changes an opening type with standard sizes", () => {
    const plan = setOpeningKind(confirmElement(makeFixturePlan(), { type: "column", id: "C-5" }), "V-2", "door");
    expect(pendingElements(plan)).toEqual([expect.objectContaining({ id: "M-5" })]);
    expect(plan.openings.find((opening) => opening.id === "V-2")).toMatchObject({ kind: "door", sill: 0, height: 2.1 });
  });

  it("finds the columns that confine a wall and where to point at it", () => {
    const plan = makeFixturePlan();
    expect(confiningColumns(plan, "M-5")).toEqual(["C-2", "C-5"]);
    expect(elementAnchor(plan, { type: "wall", id: "M-5" })).toEqual({ x: 500, y: 420 });
  });

  it("types a wall length by moving its end", () => {
    const plan = setWallLength(makeFixturePlan(), "M-5", 4);
    expect(plan.walls.find((wall) => wall.id === "M-5")).toMatchObject({ x2: 500, y2: 520 });
  });

  it("frames the drawing with a margin when there is no photo", () => {
    expect(planBounds(makeFixturePlan(), 1)).toEqual({ x: 0, y: 20, w: 1000, h: 800 });
    expect(planBounds(makeFixturePlan(), 1, { width: 1000, height: 800 })).toEqual({ x: 0, y: 0, w: 1000, h: 800 });
  });
});
