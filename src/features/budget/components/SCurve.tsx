"use client";

import { useState, type PointerEvent } from "react";
import type { CurvePoint } from "@/lib/schedule";
import { SCurvePlot } from "./SCurvePlot";
import { SCurveTable } from "./SCurveTable";

type SCurveProps = { points: CurvePoint[]; week: number; total: number };

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function SCurve({ points, week, total }: SCurveProps) {
  const [hover, setHover] = useState<number>();
  const last = Math.max(points.length - 1, 1);
  const focus = points[hover ?? week] ?? points.at(-1)!;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setHover(Math.round(((event.clientX - box.left) / box.width) * last));
  };

  return (
    <figure className="flex flex-col gap-space-xs">
      <figcaption className="text-body-sm text-on-surface-variant">
        Planned cumulative cost (S-curve){points.some((point) => point.actual !== undefined) ? ", with the value built so far as a dashed green line" : ""}
      </figcaption>
      <div className="flex gap-space-xs">
        <div aria-hidden="true" className="flex h-40 flex-col justify-between py-0.5 text-end font-mono text-label-numeric-sm text-on-surface-variant tabular-nums">
          {[1, 0.5, 0].map((share) => (
            <span key={share}>{compact.format(total * share)}</span>
          ))}
        </div>
        <div data-testid="s-curve" className="relative h-40 flex-1 touch-none" onPointerMove={handleMove} onPointerLeave={() => setHover(undefined)}>
          <SCurvePlot points={points} total={total} focus={focus} />
        </div>
      </div>
      <SCurveTable points={points} />
    </figure>
  );
}
