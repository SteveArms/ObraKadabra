"use client";

import type { Schedule } from "@/schemas/schedule";
import { usePlayback } from "../hooks/usePlayback";
import { useTimeline } from "../store";
import { PlanVsActual } from "./PlanVsActual";
import { TimelineControls } from "./TimelineControls";
import { TimelineTrack } from "./TimelineTrack";

export function Timeline({ schedule }: { schedule: Schedule }) {
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
      <PlanVsActual schedule={schedule} week={week} />
    </section>
  );
}
