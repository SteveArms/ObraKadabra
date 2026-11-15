"use client";

import { useEffect, useMemo } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { buildElementMesh, buildPlanScene, disposeElementMesh, type ElementEntry } from "../scene";
import { useViewerStore } from "../store";
import type { StatusMaterials } from "../hooks/useStatusMaterials";

type ModelFromPlanProps = { plan: FloorPlan; materials: StatusMaterials };

export function ModelFromPlan({ plan, materials }: ModelFromPlanProps) {
  const setEntries = useViewerStore((state) => state.setEntries);
  const elements = useMemo(() => buildPlanScene(plan), [plan]);
  const meshes = useMemo(
    () => elements.map((element) => buildElementMesh(element, materials.byStatus.not_started)),
    [elements, materials],
  );

  useEffect(() => {
    const entries: ElementEntry[] = elements.map((element, index) => ({
      key: element.key,
      id: element.id,
      type: element.type,
      level: element.level,
      object: meshes[index],
    }));
    setEntries(entries);
    return () => {
      setEntries([]);
      meshes.forEach(disposeElementMesh);
    };
  }, [elements, meshes, setEntries]);

  return (
    <group name="model-from-plan">
      {meshes.map((mesh) => (
        <primitive key={mesh.name} object={mesh} />
      ))}
    </group>
  );
}
