"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { MiniPlayer, Timeline } from "@/features/schedule";
import { Viewer } from "@/features/viewer-3d";
import type { Project } from "@/schemas/project";
import { useProjectSchedule } from "../hooks/useProjectSchedule";
import { useProject } from "../hooks/useProject";
import { ProjectBar } from "./ProjectBar";
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

  return <WorkspaceLayout project={state.project} glbUrl={glbUrl} />;
}

// Desktop fits one screen (viewer, panel and timeline, no page scroll); mobile pins the viewer on top while the rest scrolls
const LAYOUT =
  "grid flex-1 grid-cols-1 [grid-template-areas:'bar'_'viewer'_'timeline'_'panel'] " +
  "lg:h-[calc(100dvh-4rem)] lg:min-h-[44rem] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:grid-rows-[auto_minmax(0,1fr)_auto] " +
  "lg:[grid-template-areas:'bar_bar'_'viewer_panel'_'timeline_timeline']";

function WorkspaceLayout({ project, glbUrl }: { project: Project; glbUrl?: string }) {
  const { schedule, week, statuses } = useProjectSchedule(project);
  return (
    <div className={LAYOUT}>
      <div className="[grid-area:bar]">
        <ProjectBar project={project} schedule={schedule} week={week} />
      </div>
      <div data-sticky-viewer className="z-30 [grid-area:viewer] max-lg:sticky max-lg:top-16 lg:min-h-0">
        <Viewer plan={project.floorPlan} glbUrl={glbUrl} className="h-[45dvh] min-h-72 lg:h-full" bottomSlot={<MiniPlayer schedule={schedule} />} />
      </div>
      <div className="[grid-area:timeline]">
        <Timeline schedule={schedule} />
      </div>
      <div className="[grid-area:panel] lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
        <WorkspacePanel schedule={schedule} week={week} statuses={statuses} projectName={project.name} />
      </div>
    </div>
  );
}
