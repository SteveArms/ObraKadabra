import { Matrix4, Mesh, type MeshStandardMaterial } from "three";
import type { InstanceRef } from "./instancing";
import type { ElementEntry } from "./registry";

type Appearance = {
  levelCut: number;
  selectedKey?: string;
  materialFor: (entry: ElementEntry) => MeshStandardMaterial;
};

const HIDDEN = new Matrix4().makeScale(0, 0, 0);

function applyToInstance(entry: ElementEntry, instance: InstanceRef, material: MeshStandardMaterial, visible: boolean, selected: boolean) {
  const proxy = entry.object;
  proxy.updateMatrix();
  instance.mesh.setMatrixAt(instance.index, visible && !selected ? proxy.matrix : HIDDEN);
  instance.mesh.setColorAt(instance.index, material.color);
  proxy.visible = visible && selected;
  if (proxy instanceof Mesh) proxy.material = material;
}

function flushInstances(instances: Set<InstanceRef["mesh"]>) {
  instances.forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  });
}

// three.js objects are mutated in place by design; React only decides which material and visibility apply
export function applyAppearance(entries: ElementEntry[], { levelCut, selectedKey, materialFor }: Appearance): void {
  const touched = new Set<InstanceRef["mesh"]>();
  for (const entry of entries) {
    const visible = entry.level <= levelCut;
    const material = materialFor(entry);
    const instance = entry.object.userData.instance as InstanceRef | undefined;
    if (instance) {
      applyToInstance(entry, instance, material, visible, entry.key === selectedKey);
      touched.add(instance.mesh);
      continue;
    }
    entry.object.visible = visible;
    entry.object.traverse((child) => {
      if (child instanceof Mesh) child.material = material;
    });
  }
  flushInstances(touched);
}
