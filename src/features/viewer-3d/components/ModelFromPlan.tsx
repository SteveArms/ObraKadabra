"use client";

import { useEffect, useMemo } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { buildPlanObjects, buildPlanScene } from "../scene";
import { useViewerStore } from "../store";
import type { StatusMaterials } from "../hooks/useStatusMaterials";

type ModelFromPlanProps = { plan: FloorPlan; materials: StatusMaterials };

export function ModelFromPlan({ plan, materials }: ModelFromPlanProps) {
  const setEntries = useViewerStore((state) => state.setEntries);
  const model = useMemo(() => buildPlanObjects(buildPlanScene(plan), materials.byStatus.not_started), [plan, materials]);

  useEffect(() => {
    setEntries(model.entries);
    return () => {
      setEntries([]);
      model.dispose();
    };
  }, [model, setEntries]);

  return (
    <group name="model-from-plan">
      {model.objects.map((object) => (
        <primitive key={object.uuid} object={object} />
      ))}
    </group>
  );
}
