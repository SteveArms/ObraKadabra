"use client";

import { cn } from "@/lib/cn";
import { useViewerStore, type ViewMode } from "../store";
import { levelLabel } from "../scene";
import { GLASS } from "./ViewerToolbar";

const VIEW_LABELS: Record<ViewMode, string> = { top: "Top view", iso: "Isometric view", front: "Front view" };
const meters = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CoordinatesBadge() {
  const hover = useViewerStore((state) => state.hover);
  const view = useViewerStore((state) => state.view);
  const levelCut = useViewerStore((state) => state.levelCut);
  const axes = hover ? `X ${meters.format(hover.x)} m · Y ${meters.format(hover.z)} m` : "X — · Y —";
  const elevation = hover ? `Elevation ${hover.y >= 0 ? "+" : ""}${meters.format(hover.y)} m` : "Point at the model";

  return (
    <div data-testid="viewer-coordinates" className={cn(GLASS, "inline-flex items-center gap-space-xs p-space-xs")}>
      <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-surface-container-highest font-mono text-label-numeric-sm font-bold text-primary">
        N
      </span>
      <div className="font-mono text-label-numeric-sm tabular-nums">
        <p className="font-semibold text-on-surface">{axes}</p>
        <p className="text-on-surface-variant">
          {elevation} · {VIEW_LABELS[view]} · {levelLabel(levelCut)}
        </p>
      </div>
    </div>
  );
}
