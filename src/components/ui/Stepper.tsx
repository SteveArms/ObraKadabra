import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type StepperProps = {
  steps: string[];
  currentIndex: number;
  label: string;
};

// On narrow screens only the current step keeps its visible name; the others stay readable to screen readers
export function Stepper({ steps, currentIndex, label }: StepperProps) {
  return (
    <ol aria-label={label} className="flex items-center gap-space-sm">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-space-xs">
            {index > 0 ? <span aria-hidden="true" className="h-px w-4 bg-outline-variant sm:w-6" /> : null}
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-label-numeric-sm",
                isCurrent && "bg-primary-container text-on-primary",
                isDone && "bg-primary-fixed text-primary",
                !isCurrent && !isDone && "bg-surface-container-high text-on-surface-variant",
              )}
            >
              {isDone ? <Icon name="check" size={16} /> : index + 1}
            </span>
            <span className={cn("text-body-md whitespace-nowrap", isCurrent ? "font-semibold text-on-surface" : "text-on-surface-variant max-sm:sr-only")}>
              {step}
              {isDone ? <span className="sr-only"> (done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
