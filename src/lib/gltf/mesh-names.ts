import type { FloorPlan } from "@/schemas/floor-plan";

export const MESH_TYPES = ["wall", "column", "slab", "footing", "roof", "door", "window"] as const;

export type MeshType = (typeof MESH_TYPES)[number];

export type MeshRef = { type: MeshType; id: string };

// Blender suffixes duplicated objects with .001, .002…; those copies still belong to the same element
export function parseMeshName(name: string): MeshRef | null {
  const match = /^([a-z]+)_(.+?)(\.\d{3})?$/.exec(name);
  if (!match) return null;
  const type = MESH_TYPES.find((candidate) => candidate === match[1]);
  return type ? { type, id: match[2] } : null;
}

export function planElementIds(plan: FloorPlan): Record<MeshType, Set<string>> {
  const ids = (items: { id: string }[]) => new Set(items.map((item) => item.id));
  return {
    wall: ids(plan.walls),
    column: ids(plan.columns),
    slab: ids(plan.slabs),
    footing: ids(plan.footings),
    roof: ids(plan.roofs),
    door: ids(plan.openings.filter((opening) => opening.kind === "door")),
    window: ids(plan.openings.filter((opening) => opening.kind === "window")),
  };
}

export function findMissingMeshRefs(names: string[], plan: FloorPlan): MeshRef[] {
  const ids = planElementIds(plan);
  return names
    .map(parseMeshName)
    .filter((ref): ref is MeshRef => ref !== null && !ids[ref.type].has(ref.id));
}
