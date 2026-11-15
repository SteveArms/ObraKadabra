import { Mesh, type Material } from "three";
import type { ElementEntry } from "./registry";

type Appearance = { levelCut: number; materialFor: (entry: ElementEntry) => Material };

// three.js objects are mutated in place by design; React only decides which material and visibility apply
export function applyAppearance(entries: ElementEntry[], { levelCut, materialFor }: Appearance): void {
  for (const entry of entries) {
    entry.object.visible = entry.level <= levelCut;
    const material = materialFor(entry);
    entry.object.traverse((child) => {
      if (child instanceof Mesh) child.material = material;
    });
  }
}
