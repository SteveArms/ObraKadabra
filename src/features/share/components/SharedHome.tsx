"use client";

import { useMemo } from "react";
import { todayWeek } from "@/features/schedule";
import { useProjectSchedule } from "@/features/workspace";
import type { SharedProject } from "@/schemas/shared";
import { addWeeks, familySummary } from "../utils";
import { ExploreHome } from "./ExploreHome";
import { FamilyCards } from "./FamilyCards";
import { LatestPhoto } from "./LatestPhoto";
import { OverallProgress } from "./OverallProgress";
import { SharedHero } from "./SharedHero";

// now comes from the request, so the server render and the browser agree on which week "today" is
type SharedHomeProps = { shared: SharedProject; now: number; glbUrl?: string };

export function SharedHome({ shared, now, glbUrl }: SharedHomeProps) {
  const { project, progress, photoUrl } = shared;
  const { schedule } = useProjectSchedule(project, progress);
  const week = todayWeek(project.startDate, schedule.totalWeeks, now) ?? 0;
  const summary = useMemo(() => familySummary(schedule, progress, week), [schedule, progress, week]);
  const finishDate = project.startDate ? addWeeks(project.startDate, schedule.totalWeeks) : undefined;

  return (
    <div data-testid="shared-view" className="mx-auto flex w-full max-w-6xl flex-col gap-space-lg px-gutter py-space-lg lg:px-gutter-desktop">
      <SharedHero project={project} />
      <OverallProgress summary={summary} week={week} startDate={project.startDate} finishDate={finishDate} />
      <FamilyCards summary={summary} schedule={schedule} week={week} startDate={project.startDate} finishDate={finishDate} />
      <ExploreHome project={project} schedule={schedule} glbUrl={glbUrl} />
      <LatestPhoto entries={progress} photoUrl={photoUrl} />
    </div>
  );
}
