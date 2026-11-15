import { InstancedMesh, MeshStandardMaterial, type Mesh, type Object3D } from "three";
import type { ElementEntry } from "./registry";
import { boxMatrix, buildElementMesh, disposeElementMesh, UNIT_BOX } from "./three-objects";
import type { SceneElement } from "./types";

// Below this many columns separate meshes cost less than the bookkeeping; above it one draw call serves them all
export const INSTANCING_MIN_COLUMNS = 24;

export type InstanceRef = { mesh: InstancedMesh; index: number };

export type PlanObjects = { objects: Object3D[]; entries: ElementEntry[]; dispose: () => void };

function toEntry(element: SceneElement, object: Object3D): ElementEntry {
  return { key: element.key, id: element.id, type: element.type, level: element.level, object };
}

function isSingleBoxColumn(element: SceneElement): boolean {
  return element.type === "column" && element.shape.kind === "boxes" && element.shape.boxes.length === 1;
}

// Each instanced column keeps a hidden proxy mesh as its registry object: it carries the transform, and it is
// shown with the selection material when the column is selected, since instances share one material
function instanceColumns(columns: SceneElement[], material: MeshStandardMaterial) {
  const mesh = new InstancedMesh(UNIT_BOX, new MeshStandardMaterial({ color: "#ffffff", roughness: material.roughness }), columns.length);
  mesh.name = "columns-instanced";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.instanceKeys = columns.map((column) => column.key);
  const proxies = columns.map((column, index) => {
    const proxy = buildElementMesh(column, material);
    if (column.shape.kind === "boxes") mesh.setMatrixAt(index, boxMatrix(column.shape.boxes[0]));
    mesh.setColorAt(index, material.color);
    proxy.visible = false;
    proxy.raycast = () => undefined;
    proxy.userData.instance = { mesh, index } satisfies InstanceRef;
    return proxy;
  });
  return { mesh, proxies };
}

export function buildPlanObjects(
  elements: SceneElement[],
  material: MeshStandardMaterial,
  minInstances = INSTANCING_MIN_COLUMNS,
): PlanObjects {
  const columns = elements.filter(isSingleBoxColumn);
  const instanced = columns.length >= minInstances ? instanceColumns(columns, material) : undefined;
  const meshes = new Map<string, Mesh>();
  elements.forEach((element) => {
    const proxy = instanced?.proxies[columns.indexOf(element)];
    meshes.set(element.key, proxy ?? buildElementMesh(element, material));
  });
  const entries = elements.map((element) => toEntry(element, meshes.get(element.key)!));
  const objects: Object3D[] = [...meshes.values(), ...(instanced ? [instanced.mesh] : [])];
  const dispose = () => {
    meshes.forEach(disposeElementMesh);
    instanced?.mesh.dispose();
    (instanced?.mesh.material as MeshStandardMaterial | undefined)?.dispose();
  };
  return { objects, entries, dispose };
}
