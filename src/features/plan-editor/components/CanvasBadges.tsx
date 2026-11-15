"use client";

import { Icon } from "@/components/ui/Icon";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import type { CanvasView } from "../hooks/useCanvasView";
import { elementLabel } from "../labels";
import { useEditorStore } from "../store";
import { elementAnchor, elementLevel, sameRef } from "../utils";

// Amber "Review" tags float over each pending element; they are buttons, so review also works from the keyboard
export function CanvasBadges({ plan, pending, view }: { plan: FloorPlan; pending: PendingElement[]; view: CanvasView }) {
  const level = useEditorStore((state) => state.level);
  const selected = useEditorStore((state) => state.selected);
  const select = useEditorStore((state) => state.select);
  return (
    <>
      {pending.map((item) => {
        const anchor = elementAnchor(plan, item);
        if (!anchor || elementLevel(plan, item) !== level || sameRef(item, selected)) return null;
        const at = view.toScreen(anchor);
        const label = elementLabel(plan, item);
        return (
          <button
            key={item.id}
            type="button"
            aria-label={`Review ${label}`}
            data-testid={`review-badge-${item.id}`}
            onClick={() => select({ type: item.type, id: item.id })}
            style={{ left: at.x, top: at.y }}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] items-center gap-1 rounded-full bg-status-warning px-2 py-0.5 text-body-sm font-semibold text-on-secondary-fixed shadow-float"
          >
            <Icon name="help" size={14} />
            Review
          </button>
        );
      })}
    </>
  );
}
