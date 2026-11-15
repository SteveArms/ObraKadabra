import { Box3, type Object3D } from "three";
import type { SceneElement } from "./types";

export type Footprint = { minX: number; maxX: number; minZ: number; maxZ: number };

function elementFootprint(element: SceneElement): Footprint[] {
  if (element.shape.kind === "prism") {
    const xs = element.shape.prism.polygon.map(([x]) => x);
    const zs = element.shape.prism.polygon.map(([, z]) => z);
    return [{ minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) }];
  }
  return element.shape.boxes.map(({ center: [x, , z], size: [sx, , sz], rotationY }) => {
    const [cos, sin] = [Math.abs(Math.cos(rotationY)), Math.abs(Math.sin(rotationY))];
    const halfX = (cos * sx + sin * sz) / 2;
    const halfZ = (sin * sx + cos * sz) / 2;
    return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
  });
}

function union(footprints: Footprint[]): Footprint | undefined {
  if (footprints.length === 0) return undefined;
  return footprints.reduce((a, b) => ({
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minZ: Math.min(a.minZ, b.minZ),
    maxZ: Math.max(a.maxZ, b.maxZ),
  }));
}

export function sceneFootprint(elements: SceneElement[]): Footprint | undefined {
  return union(elements.flatMap(elementFootprint));
}

export function objectsFootprint(objects: Object3D[]): Footprint | undefined {
  const box = new Box3();
  objects.forEach((object) => box.expandByObject(object));
  return box.isEmpty() ? undefined : { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z };
}

// A GLB exported with other axes, units or origin lands far from the plan outline and is rejected
export function footprintsMatch(a: Footprint, b: Footprint, tolerance = 0.75): boolean {
  return (["minX", "maxX", "minZ", "maxZ"] as const).every((side) => Math.abs(a[side] - b[side]) <= tolerance);
}
