import { cn } from "@/lib/cn";

export type Metric = { label: string; value: string; testId?: string };

type MetricListProps = {
  metrics: Metric[];
  className?: string;
};

export function MetricList({ metrics, className }: MetricListProps) {
  return (
    <dl className={cn("grid grid-cols-2 gap-space-sm rounded-lg bg-surface-container-low p-space-md sm:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-body-sm text-on-surface-variant">{metric.label}</dt>
          <dd data-testid={metric.testId} className="font-mono text-label-numeric-md tabular-nums whitespace-nowrap text-on-surface">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
