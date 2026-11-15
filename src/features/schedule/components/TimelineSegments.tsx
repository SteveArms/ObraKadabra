import { cn } from "@/lib/cn";
import { activityLabel } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { activityState, dayRatio } from "../utils";

const STATE_CLASSES = {
  done: "bg-status-done/20 text-status-done-text",
  active: "bg-status-active/20 text-status-active-text ring-2 ring-inset ring-status-active",
  future: "bg-surface-container-high text-on-surface-variant",
};

// Labels only ride segments wide enough to hold them; the Gantt tab lists every activity in full
const LABEL_MIN_RATIO = 0.12;

export function TimelineSegments({ schedule, week }: { schedule: Schedule; week: number }) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {schedule.activities.map((activity) => {
        const left = dayRatio(activity.startDay, schedule);
        const width = dayRatio(activity.endDay, schedule) - left;
        const state = activityState(activity, week);
        return (
          <div
            key={`${activity.stage}@${activity.level}`}
            data-testid="timeline-segment"
            data-stage={activity.stage}
            data-start-week={activity.startWeek}
            data-end-week={activity.endWeek}
            className={cn("absolute inset-y-0 flex items-center rounded-md px-1.5 font-mono text-label-numeric-sm", STATE_CLASSES[state])}
            style={{ left: `calc(${left * 100}% + 1px)`, width: `calc(${width * 100}% - 2px)` }}
          >
            {width >= LABEL_MIN_RATIO ? <span className="hidden whitespace-nowrap sm:inline">{activityLabel(activity.stage, activity.level)}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
