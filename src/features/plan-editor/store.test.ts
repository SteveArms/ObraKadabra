import { beforeEach, describe, expect, it } from "vitest";
import { wallLength } from "@/lib/geometry";
import { pendingElements } from "@/lib/plan";
import { removeElement, setWallKind } from "./edits";
import { useEditorStore } from "./store";
import { makeFixturePlan } from "@/lib/ai/test-fixture";
import { dragVertex, moveVertex } from "./vertices";

const SNAP = { gridStep: 5, tolerance: 10, angleTolerance: 5 };
const state = () => useEditorStore.getState();
const wall = (id: string) => state().plan?.walls.find((item) => item.id === id);

describe("editor store", () => {
  beforeEach(() => state().load("p-1", makeFixturePlan()));

  it("starts with the three elements the AI was unsure about", () => {
    expect(pendingElements(state().plan!).map((item) => item.id)).toEqual(["M-5", "V-2", "C-5"]);
  });

  it("moves a vertex and undoes and redoes it", () => {
    state().commit((plan) => moveVertex(plan, 1, { x: 500, y: 720 }, { x: 500, y: 600 }));
    expect(wallLength(wall("M-5")!) * 0.01).toBeCloseTo(4.8);
    state().undo();
    expect(wallLength(wall("M-5")!) * 0.01).toBeCloseTo(6);
    state().redo();
    expect(wallLength(wall("M-5")!) * 0.01).toBeCloseTo(4.8);
  });

  it("turns a wall into a 15 cm partition and confirms it", () => {
    state().commit((plan) => setWallKind(plan, "M-5", "partition"));
    expect(wall("M-5")).toMatchObject({ kind: "partition", thickness: 0.15, confidence: 1 });
    expect(pendingElements(state().plan!)).toHaveLength(2);
  });

  it("deletes a wall with its doors and brings both back on undo", () => {
    const doors = state().plan!.openings.filter((opening) => opening.wallId === "M-5");
    expect(doors).toHaveLength(1);
    state().commit((plan) => removeElement(plan, { type: "wall", id: "M-5" }));
    expect(wall("M-5")).toBeUndefined();
    expect(state().plan!.openings.some((opening) => opening.wallId === "M-5")).toBe(false);
    state().undo();
    expect(state().plan!.openings.filter((opening) => opening.wallId === "M-5")).toEqual(doors);
  });

  it("records a drag as one step and drops it when nothing moved", () => {
    state().checkpoint();
    state().preview(moveVertex(state().plan!, 1, { x: 500, y: 720 }, { x: 500, y: 650 }));
    state().preview(moveVertex(state().plan!, 1, { x: 500, y: 650 }, { x: 500, y: 600 }));
    expect(state().past).toHaveLength(1);
    state().undo();
    expect(wall("M-5")?.y2).toBe(720);
    state().checkpoint();
    state().dropCheckpoint();
    expect(state().past).toHaveLength(0);
  });
});

describe("dragVertex", () => {
  it("keeps the wall vertical and lands the free end on the grid", () => {
    const plan = dragVertex(makeFixturePlan(), 1, { x: 500, y: 720 }, { x: 507, y: 598 }, SNAP);
    expect(plan.walls.find((item) => item.id === "M-5")).toMatchObject({ x2: 500, y2: 600 });
  });

  it("snaps onto a nearby vertex", () => {
    const plan = dragVertex(makeFixturePlan(), 1, { x: 500, y: 720 }, { x: 893, y: 424 }, SNAP);
    expect(plan.walls.find((item) => item.id === "M-5")).toMatchObject({ x2: 900, y2: 420 });
  });

  it("drags the corner column and room corners with the walls", () => {
    const plan = moveVertex(makeFixturePlan(), 1, { x: 900, y: 720 }, { x: 950, y: 720 });
    expect(plan.columns.find((column) => column.x === 950 && column.y === 720)).toBeDefined();
    expect(plan.rooms.flatMap((room) => room.polygon).filter((point) => point.x === 950)).toHaveLength(1);
  });
});
