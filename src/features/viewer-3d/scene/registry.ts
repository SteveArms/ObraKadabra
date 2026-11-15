import type { Object3D } from "three";
import { parseMeshName, type MeshType } from "@/lib/gltf";
import type { FloorPlan } from "@/schemas/floor-plan";
import { elementLevel } from "./element-info";

export type ElementEntry = {
  key: string;
  id: string;
  type: MeshType;
  level: number;
  object: Object3D;
};

// Walks a loaded model and keeps the outermost object of each <type>_<id> that exists in the plan
export function registerElements(root: Object3D, plan: FloorPlan): ElementEntry[] {
  const entries = new Map<string, ElementEntry>();
  root.traverse((object) => {
    const ref = parseMeshName(object.name);
    if (!ref) return;
    const key = `${ref.type}_${ref.id}`;
    const level = elementLevel(plan, ref.type, ref.id);
    if (level === undefined || entries.has(key)) return;
    object.userData.elementKey = key;
    entries.set(key, { key, id: ref.id, type: ref.type, level, object });
  });
  return [...entries.values()];
}

export function findElementKey(object: Object3D | null, instanceId?: number): string | undefined {
  const instanceKeys = object?.userData.instanceKeys as string[] | undefined;
  if (instanceKeys && instanceId !== undefined) return instanceKeys[instanceId];
  for (let current = object; current; current = current.parent) {
    if (typeof current.userData.elementKey === "string") return current.userData.elementKey;
  }
  return undefined;
}
