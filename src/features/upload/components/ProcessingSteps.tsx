import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { PROCESSING_STEPS } from "@/schemas/plan-extraction";
import { ACTIVE_HINTS, STEP_LABELS, stepDetail, stepStatus, type Progress, type StepStatus } from "../progress";

const STATUS_COPY: Record<StepStatus, string> = { done: "Done", active: "In progress", queued: "Queued" };
const STATUS_ICON: Record<StepStatus, string> = { done: "check", active: "progress_activity", queued: "schedule" };

export function ProcessingSteps({ progress, failed }: { progress: Progress; failed: boolean }) {
  return (
    <ol aria-label="Processing steps" className="flex flex-col gap-space-xs">
      {PROCESSING_STEPS.map((step) => {
        const status = stepStatus(progress, step, failed);
        const detail = stepDetail(progress, step) ?? (status === "active" ? ACTIVE_HINTS[step] : null);
        return (
          <li
            key={step}
            data-testid="processing-step"
            data-step={step}
            data-status={status}
            className={cn("flex gap-space-sm rounded-md p-space-sm", status === "active" && "bg-surface-container-low")}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                status === "done" && "bg-secondary-fixed text-secondary",
                status === "active" && "bg-primary-fixed text-primary",
                status === "queued" && "bg-surface-container-high text-on-surface-variant",
              )}
            >
              <Icon name={STATUS_ICON[status]} size={18} className={status === "active" ? "motion-safe:animate-spin" : undefined} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="flex flex-wrap items-baseline justify-between gap-x-space-sm">
                <span className={cn("text-body-lg font-medium", status === "active" && "text-primary", status === "queued" && "text-on-surface-variant")}>{STEP_LABELS[step]}</span>
                <span className="font-mono text-label-numeric-sm text-on-surface-variant uppercase">{STATUS_COPY[status]}</span>
              </p>
              {detail ? <p className="text-body-md text-pretty text-on-surface-variant">{detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
