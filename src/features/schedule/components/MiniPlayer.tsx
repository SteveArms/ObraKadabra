"use client";

import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { activityLabel } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { usePlaybackControls } from "../hooks/usePlaybackControls";
import { activityAt } from "../utils";

const STEP_BUTTON =
  "flex size-10 shrink-0 items-center justify-center rounded-md text-on-surface transition-[background-color,scale] duration-150 ease-out hover:bg-surface-container-high disabled:opacity-40 motion-safe:not-disabled:active:scale-[0.96] max-sm:size-11";

// Simulation controls that live over the 3D model, so the user watches the house while playing it
export function MiniPlayer({ schedule }: { schedule: Schedule }) {
  const { week, totalWeeks, playing, canGoBack, canGoForward, previous, next, toggle } = usePlaybackControls();
  const activity = activityAt(schedule, week);

  return (
    <div role="group" aria-label="Simulation controls" data-testid="mini-player" className={cn(GLASS_SURFACE, "flex flex-col overflow-hidden")}>
      <div className="flex items-center gap-0.5 p-1">
        <button type="button" aria-label="Previous week" onClick={previous} disabled={!canGoBack} className={STEP_BUTTON}>
          <Icon name="skip_previous" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause simulation" : "Play simulation"}
          onClick={toggle}
          data-testid="mini-player-toggle"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary transition-[background-color,scale] duration-150 ease-out hover:bg-primary-hover motion-safe:active:scale-[0.96] max-sm:size-11"
        >
          <Icon name={playing ? "pause" : "play_arrow"} filled size={22} />
        </button>
        <button type="button" aria-label="Next week" onClick={next} disabled={!canGoForward} className={STEP_BUTTON}>
          <Icon name="skip_next" />
        </button>
        <div className="min-w-0 flex-1 px-space-xs sm:w-44 sm:flex-none">
          <p className="font-mono text-label-numeric-md tabular-nums">
            W{week} <span className="text-on-surface-variant">/ {totalWeeks}</span>
          </p>
          <p className="truncate text-body-sm text-on-surface-variant">{activity ? activityLabel(activity.stage, activity.level) : "—"}</p>
        </div>
      </div>
      <div aria-hidden="true" className="h-1 bg-primary-fixed">
        <div className="h-full bg-primary-container transition-[width] duration-150 ease-out" style={{ width: `${(week / Math.max(totalWeeks, 1)) * 100}%` }} />
      </div>
    </div>
  );
}
