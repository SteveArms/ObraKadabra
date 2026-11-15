"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import { elementLabel, REVIEW_HINTS, TYPE_ICONS } from "../labels";
import { useEditorStore } from "../store";
import { sameRef } from "../utils";

export function PendingList({ plan, pending }: { plan: FloorPlan; pending: PendingElement[] }) {
  const selected = useEditorStore((state) => state.selected);
  const focus = useEditorStore((state) => state.focus);
  return (
    <section aria-labelledby="pending-title" className="flex flex-col gap-space-xs">
      <h3 id="pending-title" className="font-mono text-label-numeric-sm tracking-[0.05em] text-on-surface-variant uppercase">
        Pending corrections
      </h3>
      {pending.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">Nothing left to review. Build the 3D model when you are ready.</p>
      ) : (
        <ul data-testid="pending-list" className="flex flex-col gap-1">
          {pending.map((item) => {
            const active = sameRef(item, selected);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => focus({ type: item.type, id: item.id })}
                  className={cn("flex min-h-10 w-full items-center gap-space-xs rounded-md px-space-xs text-start transition-[background-color] duration-150", active ? "bg-secondary-fixed/60" : "bg-surface-container-low hover:bg-surface-container")}
                >
                  <Icon name={TYPE_ICONS[item.type]} size={18} className="text-secondary" />
                  <span className="flex-1 text-body-md">{elementLabel(plan, item)}</span>
                  <span className="font-mono text-label-numeric-sm text-on-surface-variant">{REVIEW_HINTS[item.type]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
