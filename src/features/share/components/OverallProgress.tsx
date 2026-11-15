import { formatDate, formatWholePercent } from "@/lib/format";
import { TONE_MESSAGES, type FamilySummary } from "../utils";

type OverallProgressProps = { summary: FamilySummary; week: number; startDate?: string; finishDate?: string };

export function OverallProgress({ summary, week, startDate, finishDate }: OverallProgressProps) {
  const percent = formatWholePercent(summary.percent);
  return (
    <section aria-labelledby="overall-progress" className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 id="overall-progress" className="font-mono text-label-numeric-sm tracking-[0.05em] text-primary uppercase">
          Overall progress
        </h2>
        <p className="flex flex-wrap items-baseline gap-x-space-xs">
          <span data-testid="shared-progress" className="font-display text-display-lg text-primary tabular-nums">
            {percent}
          </span>
          <span className="font-display text-headline-sm">built</span>
        </p>
        <p data-testid="shared-tone" data-tone={summary.tone} className="text-body-md text-pretty text-on-surface-variant">
          {TONE_MESSAGES[summary.tone]}
        </p>
      </div>
      <div role="progressbar" aria-label="Overall progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(summary.percent * 100)} className="h-3 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-status-done" style={{ width: percent }} />
      </div>
      <div className="grid grid-cols-3 gap-space-xs text-body-sm text-on-surface-variant">
        <span>Start{startDate ? <span className="block font-mono tabular-nums">{formatDate(startDate)}</span> : null}</span>
        <span className="text-center font-medium text-primary">Today<span className="block font-mono tabular-nums">Week {week}</span></span>
        <span className="text-end">Ready to move in{finishDate ? <span className="block font-mono tabular-nums">{formatDate(finishDate)}</span> : null}</span>
      </div>
    </section>
  );
}
