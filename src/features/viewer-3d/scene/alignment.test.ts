import { Group, Mesh, MeshBasicMaterial } from "three";
import { describe, expect, it } from "vitest";
import { demoProjects } from "@/lib/projects";
import { footprintsMatch, objectsFootprint, sceneFootprint } from "./alignment";
import { buildPlanScene } from "./plan-scene";
import { buildElementMesh } from "./three-objects";

const elements = buildPlanScene(demoProjects()[0].floorPlan);
const material = new MeshBasicMaterial();

function modelOf(transform: (root: Group) => void) {
  const root = new Group();
  elements.forEach((element) => root.add(buildElementMesh(element, material)));
  transform(root);
  root.updateMatrixWorld(true);
  return objectsFootprint(root.children)!;
}

describe("footprint alignment", () => {
  const plan = sceneFootprint(elements)!;

  it("accepts a model built on the plan axes", () => {
    expect(footprintsMatch(modelOf(() => undefined), plan)).toBe(true);
  });

  it("rejects a model mirrored on Z, shifted or in centimeters", () => {
    expect(footprintsMatch(modelOf((root) => root.scale.set(1, 1, -1)), plan)).toBe(false);
    expect(footprintsMatch(modelOf((root) => root.position.set(3, 0, 0)), plan)).toBe(false);
    expect(footprintsMatch(modelOf((root) => root.scale.setScalar(100)), plan)).toBe(false);
  });

  it("has no footprint without objects", () => {
    expect(objectsFootprint([new Mesh()])).toBeUndefined();
    expect(sceneFootprint([])).toBeUndefined();
  });
});
