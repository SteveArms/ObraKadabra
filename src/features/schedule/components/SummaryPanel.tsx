import { Icon } from "@/components/ui/Icon";
import { KpiCard } from "@/components/ui/KpiCard";
import { formatCount, formatPercent, formatSoles } from "@/lib/format";
import { activityLabel, plannedCostAt, plannedProgressAt } from "@/lib/schedule";
import type { ElementStatus, Schedule } from "@/schemas/schedule";
import { activityAt } from "../utils";

type SummaryPanelProps = { schedule: Schedule; week: number; statuses: Record<string, ElementStatus> };

export function SummaryPanel({ schedule, week, statuses }: SummaryPanelProps) {
  const activity = activityAt(schedule, week);
  const delayed = Object.values(statuses).filter((status) => status === "delayed").length;
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <p className="font-mono text-label-numeric-sm tracking-[0.05em] text-on-surface-variant uppercase">Active stage</p>
          <h3 data-testid="summary-stage" className="font-display text-headline-md">
            {activity ? activityLabel(activity.stage, activity.level) : "Not scheduled"}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-secondary-fixed px-space-xs py-0.5 font-mono text-label-numeric-sm text-on-secondary-fixed tabular-nums">
          Week {week} of {schedule.totalWeeks}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <KpiCard label="Planned progress" value={formatPercent(plannedProgressAt(schedule, week))} hint="By working days" />
        <div data-testid="kpi-invested">
          <KpiCard label="Planned spend" value={formatSoles(plannedCostAt(schedule, week))} hint={`of ${formatSoles(schedule.totalCost)}`} />
        </div>
      </div>
      {delayed > 0 ? (
        <p role="status" className="flex items-start gap-space-xs rounded-lg bg-error-container p-space-sm text-body-md text-on-error-container">
          <Icon name="warning" className="mt-0.5" />
          {formatCount(delayed, "element is", "elements are")} behind the plan this week.
        </p>
      ) : null}
    </div>
  );
}
