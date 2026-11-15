"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { registerElements } from "../scene";
import { useViewerStore } from "../store";

type ModelFromGlbProps = { url: string; plan: FloorPlan };

// The GLB must follow the plan's axes: meters, Y up, plan x → world x and plan y → world z
export function ModelFromGlb({ url, plan }: ModelFromGlbProps) {
  const { scene } = useGLTF(url);
  const setEntries = useViewerStore((state) => state.setEntries);
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    setEntries(registerElements(model, plan));
    return () => setEntries([]);
  }, [model, plan, setEntries]);

  return <primitive object={model} />;
}
