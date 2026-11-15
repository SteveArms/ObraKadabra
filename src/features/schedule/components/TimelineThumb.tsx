import { WORKDAYS_PER_WEEK } from "@/data/yields";
import { formatSoles } from "@/lib/format";
import { activityLabel, plannedCostAt } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { activityAt, dayRatio } from "../utils";

export function TimelineThumb({ schedule, week }: { schedule: Schedule; week: number }) {
  const activity = activityAt(schedule, week);
  const position = dayRatio(Math.min(week * WORKDAYS_PER_WEEK, schedule.totalDays), schedule);
  const edge = position < 0.15 ? "translate-x-0" : position > 0.85 ? "-translate-x-full" : "-translate-x-1/2";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0" style={{ left: `${position * 100}%` }}>
      <span className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-container-lowest bg-primary-container shadow-float" />
      <span
        data-testid="timeline-tooltip"
        className={`absolute bottom-full mb-1 rounded-md bg-inverse-surface px-2 py-1 font-mono text-label-numeric-sm whitespace-nowrap text-inverse-on-surface tabular-nums ${edge}`}
      >
        W{week} · {activity ? activityLabel(activity.stage, activity.level) : "—"} · {formatSoles(plannedCostAt(schedule, week))}
      </span>
    </div>
  );
}
