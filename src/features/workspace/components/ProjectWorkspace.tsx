"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Viewer } from "@/features/viewer-3d";
import { useProject } from "../hooks/useProject";
import { ProjectBar } from "./ProjectBar";
import { TimelineSlot } from "./TimelineSlot";
import { WorkspacePanel } from "./WorkspacePanel";

type ProjectWorkspaceProps = { projectId: string; glbUrl?: string };

export function ProjectWorkspace({ projectId, glbUrl }: ProjectWorkspaceProps) {
  const state = useProject(projectId);

  if (state.status === "loading") return <p className="px-gutter py-space-xl text-body-md lg:px-gutter-desktop">Loading project…</p>;
  if (state.status === "missing") {
    return (
      <div className="flex flex-col items-start gap-space-sm px-gutter py-space-xl lg:px-gutter-desktop">
        <h1 className="font-display text-headline-md">Project not found</h1>
        <p className="text-body-md text-on-surface-variant">It may have been deleted, or it was saved in another browser.</p>
        <Link href="/" className={buttonClasses("primary")}>
          Go to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ProjectBar project={state.project} />
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <Viewer plan={state.project.floorPlan} glbUrl={glbUrl} className="h-[60dvh] min-h-104 lg:col-span-8 lg:h-170" />
        <div className="lg:col-span-4">
          <WorkspacePanel />
        </div>
      </div>
      <TimelineSlot />
    </div>
  );
}
