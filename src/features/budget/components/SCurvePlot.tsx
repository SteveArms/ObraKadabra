import { formatSoles } from "@/lib/format";
import type { CurvePoint } from "@/lib/schedule";

type SCurvePlotProps = { points: CurvePoint[]; total: number; focus: CurvePoint };

// Plot space is 0–100 on both axes; strokes keep 2px with non-scaling-stroke and labels live in HTML so they never stretch
export function SCurvePlot({ points, total, focus }: SCurvePlotProps) {
  const last = Math.max(points.length - 1, 1);
  const x = (week: number) => (week / last) * 100;
  const y = (value: number) => 100 - (total ? (value / total) * 100 : 0);
  const path = points.map((point, index) => `${index ? "L" : "M"}${x(point.week)},${y(point.planned)}`).join(" ");
  const actual = points.filter((point) => point.actual !== undefined);
  const actualPath = actual.map((point, index) => `${index ? "L" : "M"}${x(point.week)},${y(point.actual ?? 0)}`).join(" ");
  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        {[0, 0.5, 1].map((share) => (
          <line key={share} x1={0} x2={100} y1={y(total * share)} y2={y(total * share)} className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${path} L100,100 L0,100 Z`} className="fill-primary-container/10" />
        <path d={path} fill="none" className="stroke-primary-container" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {actual.length > 1 ? <path data-testid="s-curve-actual" d={actualPath} fill="none" className="stroke-status-done" strokeWidth={2} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" /> : null}
        <line x1={x(focus.week)} x2={x(focus.week)} y1={0} y2={100} className="stroke-outline" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-container-lowest bg-primary-container"
        style={{ left: `${x(focus.week)}%`, top: `${y(focus.planned)}%` }}
      />
      <span
        data-testid="s-curve-tooltip"
        className="absolute top-0 rounded-md bg-inverse-surface px-2 py-1 font-mono text-label-numeric-sm whitespace-nowrap text-inverse-on-surface tabular-nums"
        style={{ left: `${x(focus.week)}%`, transform: `translateX(${focus.week / last > 0.6 ? "-105%" : "5%"})` }}
      >
        W{focus.week} · {formatSoles(focus.planned)}
      </span>
    </>
  );
}
