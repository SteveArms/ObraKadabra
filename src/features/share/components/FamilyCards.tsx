import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { activityAt } from "@/features/schedule";
import { formatCount, formatDate, formatMonth, formatSoles } from "@/lib/format";
import { activityLabel } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { addWeeks, type FamilySummary } from "../utils";

type FamilyCardProps = { label: string; icon: string; value: ReactNode; hint?: ReactNode; testId: string };

function FamilyCard({ label, icon, value, hint, testId }: FamilyCardProps) {
  return (
    <li data-testid={testId} className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
      <div className="flex items-center justify-between gap-space-xs text-body-sm font-medium text-on-surface-variant">
        {label}
        <Icon name={icon} className="text-primary" />
      </div>
      <div className="font-display text-headline-sm text-balance">{value}</div>
      {hint ? <div className="text-body-sm text-on-surface-variant">{hint}</div> : null}
    </li>
  );
}

type FamilyCardsProps = { summary: FamilySummary; schedule: Schedule; week: number; startDate?: string; finishDate?: string };

export function FamilyCards({ summary, schedule, week, startDate, finishDate }: FamilyCardsProps) {
  const activity = week > 0 ? activityAt(schedule, week) : undefined;
  const party = summary.celebration;
  const partyDate = party && startDate ? addWeeks(startDate, party.endWeek) : finishDate;
  const spent = summary.total > 0 ? summary.invested / summary.total : 0;
  return (
    <ul aria-label="At a glance" className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
      <FamilyCard testId="card-stage" label="Current stage" icon="foundation" value={activity ? activityLabel(activity.stage, activity.level) : "Getting ready"} hint={`Week ${Math.max(week, 0)} of ${schedule.totalWeeks}`} />
      <FamilyCard testId="card-move-in" label="Time to move in" icon="calendar_month" value={summary.weeksLeft > 0 ? formatCount(summary.weeksLeft, "week", "weeks") : "Ready"} hint={finishDate ? `Estimated ${formatMonth(finishDate)}` : undefined} />
      <FamilyCard
        testId="card-invested"
        label="Money invested"
        icon="account_balance_wallet"
        value={<span className="font-mono tabular-nums">{formatSoles(summary.invested)}</span>}
        hint={
          <span className="flex flex-col gap-1">
            of {formatSoles(summary.total)} budget
            <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(spent, 1) * 100}%` }} />
            </span>
          </span>
        }
      />
      <FamilyCard
        testId="card-celebration"
        label="Next big celebration"
        icon="celebration"
        value={<span className="text-secondary">{party ? (party.stage === "beams_slab" ? "Roofing day!" : "The roof goes on!") : "Move-in day!"}</span>}
        hint={[party ? `Floor ${party.level} ${party.stage === "beams_slab" ? "slab" : "roof"}` : undefined, partyDate ? formatDate(partyDate) : undefined].filter(Boolean).join(" · ")}
      />
    </ul>
  );
}
