import { WORKDAYS_PER_WEEK } from "@/data/yields";
import { cn } from "@/lib/cn";
import { activityLabel } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { activityState, dayRatio } from "../utils";

const BAR_CLASSES = { done: "bg-status-done", active: "bg-status-active", future: "bg-outline-variant" };
const STATE_TEXT = { done: "done", active: "in progress", future: "not started" };

export function GanttPanel({ schedule, week }: { schedule: Schedule; week: number }) {
  const today = dayRatio(Math.min(week * WORKDAYS_PER_WEEK, schedule.totalDays), schedule) * 100;
  return (
    <ol aria-label="Schedule by stage" data-testid="gantt" className="flex flex-col gap-space-xs">
      {schedule.activities.map((activity) => {
        const state = activityState(activity, week);
        const left = dayRatio(activity.startDay, schedule) * 100;
        const width = Math.max(dayRatio(activity.endDay, schedule) * 100 - left, 1);
        const weeks = activity.startWeek === activity.endWeek ? `W${activity.startWeek}` : `W${activity.startWeek}–${activity.endWeek}`;
        return (
          <li key={`${activity.stage}@${activity.level}`} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-space-xs">
            <span className="flex flex-col text-body-sm">
              <span className="truncate">{activityLabel(activity.stage, activity.level)}</span>
              <span className="font-mono text-label-numeric-sm text-on-surface-variant tabular-nums">
                {weeks} · {STATE_TEXT[state]}
              </span>
            </span>
            <span className="relative h-4 rounded-md bg-surface-container">
              <span className={cn("absolute inset-y-0 rounded-md", BAR_CLASSES[state])} style={{ left: `${left}%`, width: `${width}%` }} />
              <span aria-hidden="true" className="absolute -inset-y-1 w-0.5 bg-secondary-container" style={{ left: `${today}%` }} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
