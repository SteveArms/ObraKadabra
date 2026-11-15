import { Card } from "./Card";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span className="font-mono text-label-numeric-lg tabular-nums">{value}</span>
      {hint ? <span className="text-body-sm text-on-surface-variant">{hint}</span> : null}
    </Card>
  );
}
