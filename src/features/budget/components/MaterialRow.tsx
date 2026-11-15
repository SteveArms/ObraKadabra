import { formatSoles } from "@/lib/format";
import type { WeekMaterial } from "@/lib/schedule";
import { MATERIAL_LABELS, UNIT_LABELS } from "@/lib/takeoff";
import { purchaseCost, purchaseQuantity } from "../utils";

type MaterialRowProps = { entry: WeekMaterial; checked: boolean; onToggle: () => void };

const quantity = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function MaterialRow({ entry, checked, onToggle }: MaterialRowProps) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm">
        <input type="checkbox" checked={checked} onChange={onToggle} className="size-5 shrink-0 accent-primary-container" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-md">{MATERIAL_LABELS[entry.material]}</span>
          <span className="font-mono text-label-numeric-sm text-on-surface-variant tabular-nums">
            {quantity.format(purchaseQuantity(entry))} {UNIT_LABELS[entry.unit]}
          </span>
        </span>
        <span className="font-mono text-label-numeric-md tabular-nums">{formatSoles(purchaseCost(entry))}</span>
      </label>
    </li>
  );
}
