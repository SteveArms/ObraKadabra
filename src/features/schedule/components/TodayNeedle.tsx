import { WORKDAYS_PER_WEEK } from "@/data/yields";
import type { Schedule } from "@/schemas/schedule";
import { dayRatio } from "../utils";

export function TodayNeedle({ schedule, todayWeek }: { schedule: Schedule; todayWeek: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-0.5 bg-secondary-container"
      style={{ left: `${dayRatio((todayWeek - 0.5) * WORKDAYS_PER_WEEK, schedule) * 100}%` }}
    >
      <span className="absolute -top-6 -translate-x-1/2 rounded-full bg-secondary-container px-1.5 font-mono text-label-numeric-sm whitespace-nowrap text-on-secondary-container">
        Today
      </span>
    </div>
  );
}
