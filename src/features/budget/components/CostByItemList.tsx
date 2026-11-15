import { formatSoles } from "@/lib/format";
import { TAKEOFF_ITEM_LABELS } from "@/lib/takeoff";
import type { ItemCost } from "../utils";

// Each work item is a meter: the planned spend to date fills a lighter track of the same blue
export function CostByItemList({ items }: { items: ItemCost[] }) {
  return (
    <ul aria-label="Cost per work item" className="flex flex-col gap-space-sm">
      {items.map((item) => (
        <li key={item.item} className="flex flex-col gap-1">
          <div className="flex justify-between gap-space-sm text-body-sm">
            <span>{TAKEOFF_ITEM_LABELS[item.item]}</span>
            <span className="font-mono text-label-numeric-sm tabular-nums text-on-surface-variant">
              {formatSoles(item.invested)} / {formatSoles(item.total)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-fixed">
            <div className="h-full rounded-full bg-primary-container" style={{ width: `${item.total ? (item.invested / item.total) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
