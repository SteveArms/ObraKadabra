import { formatSoles } from "@/lib/format";
import type { CurvePoint } from "@/lib/schedule";

export function SCurveTable({ points }: { points: CurvePoint[] }) {
  return (
    <details className="text-body-sm">
      <summary className="cursor-pointer text-primary">Show the data as a table</summary>
      <table className="mt-space-xs w-full font-mono text-label-numeric-sm tabular-nums">
        <thead>
          <tr className="text-on-surface-variant">
            <th scope="col" className="text-start font-normal">Week</th>
            <th scope="col" className="text-end font-normal">Planned cumulative cost</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.week} className="border-t border-line">
              <td>W{point.week}</td>
              <td className="text-end">{formatSoles(point.planned)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
