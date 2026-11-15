"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { buildPlanScene, footprintsMatch, objectsFootprint, registerElements, sceneFootprint } from "../scene";
import { useViewerStore } from "../store";

type ModelFromGlbProps = { url: string; plan: FloorPlan };

// The GLB must follow the plan's axes (AGENTS.md §8); one that does not is rejected and the procedural model takes over
export function ModelFromGlb({ url, plan }: ModelFromGlbProps) {
  const { scene } = useGLTF(url);
  const setEntries = useViewerStore((state) => state.setEntries);
  const rejectGlb = useViewerStore((state) => state.rejectGlb);
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.updateMatrixWorld(true);
    const entries = registerElements(model, plan);
    if (entries.length === 0) return rejectGlb("unlabeled");
    const glb = objectsFootprint(entries.map((entry) => entry.object));
    const expected = sceneFootprint(buildPlanScene(plan));
    if (!glb || !expected || !footprintsMatch(glb, expected)) return rejectGlb("misaligned");
    setEntries(entries, "glb");
    return () => setEntries([]);
  }, [model, plan, setEntries, rejectGlb]);

  return <primitive object={model} />;
}
