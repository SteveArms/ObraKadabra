"use client";

import { useRef, type PointerEvent } from "react";
import { activityLabel } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { useSliderKeys } from "../hooks/useSliderKeys";
import { useTimeline } from "../store";
import { activityAt, weekFromRatio } from "../utils";
import { TimelineSegments } from "./TimelineSegments";
import { TimelineThumb } from "./TimelineThumb";
import { TimelineTicks } from "./TimelineTicks";
import { TodayNeedle } from "./TodayNeedle";

// One slider for pointer, touch and keyboard; segments are drawn on a working-day scale so overlapping weeks stay readable
export function TimelineTrack({ schedule }: { schedule: Schedule }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { week, totalWeeks, todayWeek, setWeek, pause } = useTimeline();
  const handleKeyDown = useSliderKeys();
  const activity = activityAt(schedule, week);

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = trackRef.current?.getBoundingClientRect();
    if (box) setWeek(weekFromRatio((event.clientX - box.left) / box.width, schedule));
  };

  return (
    <div className="flex flex-col gap-1 pt-8">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Construction week"
        aria-valuemin={1}
        aria-valuemax={totalWeeks}
        aria-valuenow={week}
        aria-valuetext={`Week ${week} of ${totalWeeks}${activity ? `, ${activityLabel(activity.stage, activity.level)}` : ""}`}
        data-testid="timeline-slider"
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          pause();
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event);
        }}
        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && moveTo(event)}
        className="relative h-11 cursor-pointer touch-none rounded-md select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <TimelineSegments schedule={schedule} week={week} />
        {todayWeek ? <TodayNeedle schedule={schedule} todayWeek={todayWeek} /> : null}
        <TimelineThumb schedule={schedule} week={week} />
      </div>
      <TimelineTicks schedule={schedule} week={week} />
    </div>
  );
}
