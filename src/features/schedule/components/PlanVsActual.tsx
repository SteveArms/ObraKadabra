import { formatPercent } from "@/lib/format";
import { plannedProgressAt } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";

type PlanVsActualProps = { schedule: Schedule; week: number; actual?: number };

function Meter({ label, value, fillClass }: { label: string; value?: number; fillClass: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-space-xs">
      <span className="w-16 shrink-0 text-body-sm text-on-surface-variant">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-fixed">
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${(value ?? 0) * 100}%` }} />
      </div>
      <span className="w-20 shrink-0 text-end font-mono text-label-numeric-sm tabular-nums">{value === undefined ? "Not logged" : formatPercent(value)}</span>
    </div>
  );
}

// Actual progress comes from approved photo logs; without any the bar says so instead of showing zero
export function PlanVsActual({ schedule, week, actual }: PlanVsActualProps) {
  return (
    <div data-testid="plan-vs-actual" className="flex flex-col gap-space-xs sm:flex-row sm:gap-space-lg">
      <Meter label="Planned" value={plannedProgressAt(schedule, week)} fillClass="bg-primary-container" />
      <Meter label="Actual" value={actual} fillClass="bg-status-done" />
    </div>
  );
}
