"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { formatSoles } from "@/lib/format";
import { activityLabel, plannedCostAt } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { usePlaybackControls } from "../hooks/usePlaybackControls";
import { PLAYBACK_SPEEDS, useTimeline } from "../store";
import { activityAt } from "../utils";

export function TimelineControls({ schedule }: { schedule: Schedule }) {
  const week = useTimeline((state) => state.week);
  const activity = activityAt(schedule, week);

  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm">
      <PlaybackButtons />
      <div className="flex min-w-0 items-center gap-space-sm">
        <div className="min-w-0 text-end">
          <p className="truncate font-display text-headline-sm">
            Week {week} · {activity ? activityLabel(activity.stage, activity.level) : "—"}
          </p>
          <p className="font-mono text-label-numeric-sm text-on-surface-variant tabular-nums">
            Planned spend {formatSoles(plannedCostAt(schedule, week))} of {formatSoles(schedule.totalCost)}
          </p>
        </div>
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-container font-mono text-label-numeric-lg text-on-primary tabular-nums">
          {week}
        </span>
      </div>
    </div>
  );
}

function PlaybackButtons() {
  const { playing, canGoBack, canGoForward, previous, next, toggle } = usePlaybackControls();
  const speed = useTimeline((state) => state.speed);
  const setSpeed = useTimeline((state) => state.setSpeed);
  return (
    <div className="flex items-center gap-space-xs">
      <Button variant="ghost" aria-label="Previous week" onClick={previous} disabled={!canGoBack} className="px-2">
        <Icon name="skip_previous" />
      </Button>
      <Button variant="primary" onClick={toggle} data-testid="timeline-play" className="min-w-36">
        <Icon name={playing ? "pause" : "play_arrow"} filled />
        {playing ? "Pause" : "Simulate 4D"}
      </Button>
      <Button variant="ghost" aria-label="Next week" onClick={next} disabled={!canGoForward} className="px-2">
        <Icon name="skip_next" />
      </Button>
      <div role="group" aria-label="Playback speed" className="ms-1 flex gap-0.5 rounded-md bg-surface-container-low p-0.5">
        {PLAYBACK_SPEEDS.map((value) => (
          <ToggleButton key={value} pressed={speed === value} onClick={() => setSpeed(value)} className="font-mono">
            {value}x
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}
