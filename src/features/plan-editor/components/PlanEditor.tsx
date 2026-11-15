"use client";

import { useEffect, useMemo } from "react";
import { ProjectStatusMessage } from "@/components/layout/ProjectStatusMessage";
import { useProject } from "@/lib/hooks/useProject";
import { pendingElements } from "@/lib/plan";
import { isDemoId } from "@/lib/projects";
import type { Project } from "@/schemas/project";
import { usePlanImage } from "../hooks/usePlanImage";
import { useEditorStore } from "../store";
import { EditorHeader } from "./EditorHeader";
import { PlanCanvas } from "./PlanCanvas";
import { PropertiesPanel } from "./PropertiesPanel";

export function PlanEditor({ projectId }: { projectId: string }) {
  const state = useProject(projectId);
  if (state.status !== "ready") return <ProjectStatusMessage status={state.status} />;
  return <EditorWorkspace project={state.project} />;
}

// Desktop fits one screen with the plan beside the properties; phones stack the plan above the panel
const LAYOUT =
  "grid flex-1 grid-cols-1 grid-rows-[auto_minmax(24rem,65dvh)_auto] " +
  "lg:h-[calc(100dvh-4rem)] lg:min-h-[44rem] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_minmax(0,1fr)]";

function EditorWorkspace({ project }: { project: Project }) {
  const load = useEditorStore((state) => state.load);
  const loadedId = useEditorStore((state) => state.projectId);
  const plan = useEditorStore((state) => state.plan);
  const level = useEditorStore((state) => state.level);
  const { image } = usePlanImage(project.id, level);
  const pending = useMemo(() => (plan ? pendingElements(plan) : []), [plan]);
  const readOnly = isDemoId(project.id);

  // Every visit starts from the saved project, so leaving without saving really discards the corrections
  useEffect(() => load(project.id, project.floorPlan), [project, load]);

  if (!plan || loadedId !== project.id) return <ProjectStatusMessage status="loading" />;
  return (
    <div data-testid="plan-editor" className={LAYOUT}>
      <div className="lg:col-span-2">
        <EditorHeader project={project} plan={plan} pending={pending} readOnly={readOnly} />
      </div>
      <PlanCanvas plan={plan} savedPlan={project.floorPlan} image={image} readOnly={readOnly} />
      <div className="lg:min-h-0 lg:shadow-overlay">
        <PropertiesPanel plan={plan} pending={pending} />
      </div>
    </div>
  );
}
