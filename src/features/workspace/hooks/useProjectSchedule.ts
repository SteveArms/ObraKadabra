"use client";

import { useEffect, useMemo } from "react";
import { todayWeek, useTimeline } from "@/features/schedule";
import { useViewerTimeline, type ElementSpan } from "@/features/viewer-3d";
import { useProgressLog } from "@/lib/hooks/useProgressLog";
import { actualProgressFrom, plasteredAt, scheduleFor, statusAt } from "@/lib/schedule";
import type { Project } from "@/schemas/project";

// Builds the project's schedule once and keeps the timeline, the 3D viewer and the panels on the same week, plan against approved photo logs
export function useProjectSchedule(project: Project) {
  const schedule = useMemo(() => scheduleFor(project.floorPlan), [project.floorPlan]);
  const week = useTimeline((state) => state.week);
  const reset = useTimeline((state) => state.reset);
  const { entries } = useProgressLog(project.id);

  useEffect(() => reset(schedule.totalWeeks, todayWeek(project.startDate, schedule.totalWeeks)), [schedule, project.startDate, reset]);

  const spans = useMemo(() => {
    const items = schedule.tasks.flatMap((task): [string, ElementSpan][] =>
      task.meshKey ? [[task.meshKey, { stage: task.stage, level: task.level, startWeek: task.startWeek, endWeek: task.endWeek }]] : [],
    );
    return Object.fromEntries(items);
  }, [schedule]);
  const progress = useMemo(() => actualProgressFrom(entries, week), [entries, week]);
  const statuses = useMemo(() => statusAt(schedule, week, progress), [schedule, week, progress]);
  const plastered = useMemo(() => plasteredAt(schedule, week), [schedule, week]);
  const timeline = useMemo(() => ({ week, spans, plastered }), [week, spans, plastered]);
  useViewerTimeline(timeline, statuses);

  return { schedule, week, statuses, progress };
}
