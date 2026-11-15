"use client";

import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { ElementStatusSchema } from "@/schemas/schedule";
import { statusOf, useViewerStore } from "../store";

export function StatusLegend() {
  const entries = useViewerStore((state) => state.entries);
  const levelCut = useViewerStore((state) => state.levelCut);
  const statuses = useViewerStore((state) => state.statuses);
  const visible = entries.filter((entry) => entry.level <= levelCut);

  return (
    <ul aria-label="Status legend" className={cn(GLASS_SURFACE, "flex max-w-full flex-wrap gap-1 self-start p-1 [&>li]:whitespace-nowrap")}>
      {ElementStatusSchema.options.map((status) => {
        const count = visible.filter((entry) => statusOf(statuses, entry.key) === status).length;
        const share = visible.length ? count / visible.length : 0;
        return (
          <li key={status} className="flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-0.5 text-body-sm text-on-surface">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", ELEMENT_STATUS_STYLES[status].dotClass)} />
            {ELEMENT_STATUS_STYLES[status].label}
            <span className="hidden font-mono text-label-numeric-sm tabular-nums text-on-surface-variant sm:inline">{formatPercent(share)}</span>
          </li>
        );
      })}
    </ul>
  );
}
