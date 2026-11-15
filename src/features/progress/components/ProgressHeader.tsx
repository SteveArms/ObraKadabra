import { Icon } from "@/components/ui/Icon";
import { formatPercent, formatSignedSoles } from "@/lib/format";
import { actualProgressAt, earnedValueAt, plannedCostAt } from "@/lib/schedule";
import type { Project } from "@/schemas/project";
import type { ActualProgress, Schedule } from "@/schemas/schedule";

type ProgressHeaderProps = { project: Project; schedule: Schedule; week: number; progress?: ActualProgress };

// Variance compares the value of what was built (approved logs, the plan elsewhere) with what the plan expected to have spent
export function ProgressHeader({ project, schedule, week, progress }: ProgressHeaderProps) {
  const variance = earnedValueAt(schedule, week, progress) - plannedCostAt(schedule, week);
  return (
    <div className="flex flex-wrap items-end justify-between gap-space-sm bg-surface-container-low px-gutter py-space-md lg:px-gutter-desktop">
      <div className="flex min-w-0 items-center gap-space-sm">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container max-sm:hidden">
          <Icon name="photo_camera" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-label-numeric-sm tracking-[0.05em] text-secondary uppercase">Week {week} of {schedule.totalWeeks}</p>
          <h1 className="font-display text-headline-md text-balance">Log weekly progress</h1>
          <p className="text-body-sm text-on-surface-variant [overflow-wrap:anywhere]">{project.name}</p>
        </div>
      </div>
      <dl className="flex gap-space-md rounded-lg bg-surface-container-lowest px-space-md py-space-xs shadow-float">
        <div>
          <dt className="font-mono text-label-numeric-sm text-on-surface-variant">Cumulative progress</dt>
          <dd data-testid="progress-cumulative" className="font-mono text-label-numeric-lg text-primary tabular-nums">
            {formatPercent(actualProgressAt(schedule, week, progress))}
          </dd>
        </div>
        <div className="border-s border-line ps-space-md">
          <dt className="font-mono text-label-numeric-sm text-on-surface-variant">Budget variance</dt>
          <dd data-testid="progress-variance" className={`font-mono text-label-numeric-lg tabular-nums ${variance < 0 ? "text-status-delayed-text" : "text-status-done-text"}`}>
            {formatSignedSoles(variance)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
