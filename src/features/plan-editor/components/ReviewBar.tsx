"use client";

import { Icon } from "@/components/ui/Icon";
import { formatCount } from "@/lib/format";
import type { PendingElement } from "@/schemas/plan-extraction";
import { useEditorStore } from "../store";
import { nextPending } from "../utils";

export function ReviewBar({ pending }: { pending: PendingElement[] }) {
  const selected = useEditorStore((state) => state.selected);
  const focus = useEditorStore((state) => state.focus);
  const next = () => {
    const ref = nextPending(pending, selected);
    if (ref) focus(ref);
  };
  return (
    <div data-testid="review-bar" className="flex flex-wrap items-center gap-space-sm rounded-lg bg-secondary-fixed/60 px-space-sm py-1.5">
      <p role="status" className="flex items-center gap-1.5 text-body-sm font-semibold text-on-secondary-fixed">
        <Icon name={pending.length ? "warning" : "check_circle"} size={18} className={pending.length ? "text-secondary" : "text-status-done-text"} />
        <span data-testid="pending-count">{pending.length ? `${formatCount(pending.length, "element needs", "elements need")} confirmation` : "Every element is confirmed"}</span>
      </p>
      {pending.length ? (
        <button type="button" onClick={next} className="flex min-h-8 items-center gap-1 rounded-md bg-surface-container-lowest px-space-xs text-body-sm font-semibold text-secondary transition-[background-color] duration-150 hover:bg-surface-bright">
          Review next
          <Icon name="arrow_forward" size={16} />
        </button>
      ) : null}
    </div>
  );
}
