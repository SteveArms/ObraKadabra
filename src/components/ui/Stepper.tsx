import { cn } from "@/lib/cn";

type StepperProps = {
  steps: string[];
  currentIndex: number;
  label: string;
};

export function Stepper({ steps, currentIndex, label }: StepperProps) {
  return (
    <ol aria-label={label} className="flex flex-wrap items-center gap-space-sm">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined} className="flex items-center gap-space-xs">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full font-mono text-label-numeric-sm",
                isCurrent || isDone ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant",
              )}
            >
              {index + 1}
            </span>
            <span className={cn("text-body-md", isCurrent ? "font-semibold text-on-surface" : "text-on-surface-variant")}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
