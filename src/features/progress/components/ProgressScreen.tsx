"use client";

import { useMemo } from "react";
import { ProjectStatusMessage } from "@/components/layout/ProjectStatusMessage";
import { todayWeek } from "@/features/schedule";
import { useProgressLog } from "@/lib/hooks/useProgressLog";
import { useProject } from "@/lib/hooks/useProject";
import { scheduleFor } from "@/lib/schedule";
import type { Project } from "@/schemas/project";
import { useProgressFlow } from "../hooks/useProgressFlow";
import { useProgressScope } from "../hooks/useProgressScope";
import { useProgressStore } from "../store";
import { AnalysisPanel } from "./AnalysisPanel";
import { BeforeAfter } from "./BeforeAfter";
import { CaptureStep } from "./CaptureStep";
import { HistoryList } from "./HistoryList";
import { LocationStep } from "./LocationStep";
import { ProgressHeader } from "./ProgressHeader";

export function ProgressScreen({ projectId }: { projectId: string }) {
  const state = useProject(projectId);
  if (state.status !== "ready") return <ProjectStatusMessage status={state.status} />;
  return <ProgressWorkspace project={state.project} />;
}

function ProgressWorkspace({ project }: { project: Project }) {
  const schedule = useMemo(() => scheduleFor(project.floorPlan), [project.floorPlan]);
  const week = todayWeek(project.startDate, schedule.totalWeeks) ?? 1;
  const { entries, save } = useProgressLog(project.id);
  const scope = useProgressScope(project, schedule, week, entries);
  const flow = useProgressFlow({ projectId: project.id, week, scope, save });
  const loading = useProgressStore((state) => state.analysis.status === "loading");
  return (
    <div data-testid="progress-screen" className="flex flex-col">
      <ProgressHeader project={project} schedule={schedule} week={week} progress={scope.progress} />
      <div className="grid gap-space-md px-gutter py-space-md lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:px-gutter-desktop">
        <div className="flex flex-col gap-space-md">
          <LocationStep choices={scope.choices} rooms={project.floorPlan.rooms} />
          <CaptureStep onPhoto={(file) => void flow.takePhoto(file)} busy={loading} />
        </div>
        <div className="flex flex-col gap-space-md">
          <AnalysisPanel schedule={schedule} expectedCount={scope.expected.length} saving={flow.saving} onConfirm={() => void flow.confirm()} onRetry={flow.retry} />
          <BeforeAfter plan={project.floorPlan} />
        </div>
      </div>
      <HistoryList entries={entries} />
    </div>
  );
}
