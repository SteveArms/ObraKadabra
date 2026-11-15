import { WORKDAYS_PER_WEEK } from "@/data/yields";
import { cn } from "@/lib/cn";
import type { Schedule } from "@/schemas/schedule";
import { dayRatio } from "../utils";

// Labels sit at each week's center on the same working-day scale as the segments, thinned so they never collide
export function TimelineTicks({ schedule, week }: { schedule: Schedule; week: number }) {
  const step = Math.max(1, Math.ceil(schedule.totalWeeks / 13));
  const weeks = Array.from({ length: schedule.totalWeeks }, (_, index) => index + 1).filter(
    (tick) => (tick - 1) % step === 0 || tick === week,
  );
  return (
    <ol aria-hidden="true" className="relative h-4">
      {weeks.map((tick) => {
        const narrowHidden = ((tick - 1) / step) % 2 === 1 && tick !== week;
        const center = dayRatio(Math.min((tick - 0.5) * WORKDAYS_PER_WEEK, schedule.totalDays), schedule);
        return (
          <li
            key={tick}
            className={cn(
              "absolute -translate-x-1/2 font-mono text-label-numeric-sm tabular-nums",
              tick === week ? "font-semibold text-primary" : "text-on-surface-variant",
              narrowHidden && "max-sm:hidden",
            )}
            style={{ left: `${center * 100}%` }}
          >
            W{tick}
          </li>
        );
      })}
    </ol>
  );
}
