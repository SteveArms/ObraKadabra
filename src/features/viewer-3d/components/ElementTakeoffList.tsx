import { formatSoles } from "@/lib/format";
import { TAKEOFF_ITEM_LABELS, UNIT_LABELS, type ElementTakeoff } from "@/lib/takeoff";

const quantity = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function ElementTakeoffList({ takeoff }: { takeoff: ElementTakeoff }) {
  return (
    <dl className="flex flex-col gap-1 rounded-md bg-surface-container-low p-space-xs text-body-sm">
      {takeoff.quantities.map((line) => (
        <div key={line.item} className="flex justify-between gap-space-sm">
          <dt className="text-on-surface-variant">{TAKEOFF_ITEM_LABELS[line.item]}</dt>
          <dd className="font-mono tabular-nums">
            {quantity.format(line.quantity)} {UNIT_LABELS[line.unit]}
          </dd>
        </div>
      ))}
      <div className="flex justify-between gap-space-sm border-t border-line pt-1">
        <dt className="font-semibold">Estimated cost</dt>
        <dd className="font-mono font-semibold tabular-nums">{formatSoles(takeoff.cost)}</dd>
      </div>
    </dl>
  );
}
