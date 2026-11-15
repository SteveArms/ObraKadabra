"use client";

import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { elementTakeoff } from "@/lib/takeoff";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { ELEMENT_TYPE_LABELS, levelLabel } from "../scene";
import { statusOf, useViewerStore } from "../store";
import { ElementTakeoffList } from "./ElementTakeoffList";
import { GLASS } from "./ViewerToolbar";

export function ElementPopover({ plan }: { plan: FloorPlan }) {
  const entry = useViewerStore((state) => state.entries.find((item) => item.key === state.selectedKey));
  const statuses = useViewerStore((state) => state.statuses);
  const select = useViewerStore((state) => state.select);
  const close = useCallback(() => select(undefined), [select]);
  const takeoff = useMemo(() => (entry ? elementTakeoff(plan, entry.id) : undefined), [plan, entry]);
  useEscapeKey(Boolean(entry), close);

  if (!entry || !takeoff) return null;
  const typeLabel = ELEMENT_TYPE_LABELS[entry.type];
  const title = `${typeLabel} ${entry.id}`;

  return (
    <aside aria-label={title} data-testid="element-popover" className={cn(GLASS, "flex max-h-full w-72 max-w-full flex-col gap-space-sm overflow-y-auto overscroll-contain p-space-md shadow-overlay")}>
      <div className="flex items-start justify-between gap-space-xs">
        <div>
          <h3 className="font-display text-headline-sm">{title}</h3>
          <p className="text-body-sm text-on-surface-variant">
            {typeLabel} · {levelLabel(entry.level)}
          </p>
        </div>
        <button type="button" onClick={close} aria-label="Close details" className="flex size-8 items-center justify-center rounded-md hover:bg-surface-container">
          <Icon name="close" size={18} />
        </button>
      </div>
      <Badge status={statusOf(statuses, entry.key)} />
      <ElementTakeoffList takeoff={takeoff} />
    </aside>
  );
}
