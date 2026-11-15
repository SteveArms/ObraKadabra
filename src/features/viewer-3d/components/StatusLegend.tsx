"use client";

import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { ElementStatusSchema } from "@/schemas/schedule";
import { statusOf, useViewerStore, visibleEntries } from "../store";
import { GLASS } from "./ViewerToolbar";

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

export function StatusLegend() {
  const entries = useViewerStore((state) => state.entries);
  const levelCut = useViewerStore((state) => state.levelCut);
  const statuses = useViewerStore((state) => state.statuses);
  const visible = visibleEntries(entries, levelCut);

  return (
    <ul aria-label="Status legend" className={cn(GLASS, "flex flex-wrap gap-1 self-start p-1")}>
      {ElementStatusSchema.options.map((status) => {
        const count = visible.filter((entry) => statusOf(statuses, entry.key) === status).length;
        const share = visible.length ? count / visible.length : 0;
        return (
          <li key={status} className="flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-0.5 text-body-sm text-on-surface">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", ELEMENT_STATUS_STYLES[status].dotClass)} />
            {ELEMENT_STATUS_STYLES[status].label}
            <span className="hidden font-mono text-label-numeric-sm tabular-nums text-on-surface-variant sm:inline">{percent.format(share)}</span>
          </li>
        );
      })}
    </ul>
  );
}
