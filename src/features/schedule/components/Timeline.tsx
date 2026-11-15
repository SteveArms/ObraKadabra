"use client";

import { actualProgressAt } from "@/lib/schedule";
import type { ActualProgress, Schedule } from "@/schemas/schedule";
import { usePlayback } from "../hooks/usePlayback";
import { useTimeline } from "../store";
import { PlanVsActual } from "./PlanVsActual";
import { TimelineControls } from "./TimelineControls";
import { TimelineTrack } from "./TimelineTrack";

export function Timeline({ schedule, progress }: { schedule: Schedule; progress?: ActualProgress }) {
  usePlayback();
  const week = useTimeline((state) => state.week);
  return (
    <section
      aria-label="Timeline"
      data-testid="timeline"
      data-week={week}
      className="flex flex-col gap-space-sm border-t border-line bg-surface-container-lowest px-gutter py-space-md lg:px-gutter-desktop"
    >
      <TimelineControls schedule={schedule} />
      <TimelineTrack schedule={schedule} />
      <PlanVsActual schedule={schedule} week={week} actual={progress ? actualProgressAt(schedule, week, progress) : undefined} />
    </section>
  );
}
