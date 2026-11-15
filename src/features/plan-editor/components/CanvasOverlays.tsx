"use client";

import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import type { CanvasView } from "../hooks/useCanvasView";
import { useEditorStore } from "../store";
import { CanvasBadges } from "./CanvasBadges";
import { CanvasHint } from "./CanvasHint";
import { CanvasToolbar } from "./CanvasToolbar";
import { DecisionPopover } from "./DecisionPopover";
import { LivePreview } from "./LivePreview";
import { ToolRail } from "./ToolRail";

type CanvasOverlaysProps = {
  plan: FloorPlan;
  pending: PendingElement[];
  view: CanvasView;
  notice: string | null;
  hasPhoto: boolean;
  readOnly: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

// Tools top-left, status and the live 3D along the bottom; review tags and the decision follow the drawing
export function CanvasOverlays({ plan, pending, view, notice, hasPhoto, readOnly, isFullscreen, onToggleFullscreen }: CanvasOverlaysProps) {
  const layers = useEditorStore((state) => state.layers);
  return (
    <>
      {layers !== "original" ? <CanvasBadges plan={plan} pending={pending} view={view} /> : null}
      <div className="pointer-events-none absolute inset-space-sm flex items-start gap-space-xs">
        <div className="pointer-events-auto">
          <ToolRail />
        </div>
        <div className="pointer-events-auto min-w-0">
          <CanvasToolbar view={view} levels={plan.meta.levels} isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-space-sm bottom-space-sm flex items-end justify-between gap-space-sm">
        <CanvasHint notice={notice} missingPhoto={!hasPhoto && layers !== "ai"} readOnly={readOnly} />
        <LivePreview readOnly={readOnly} />
      </div>
      {layers !== "original" ? <DecisionPopover plan={plan} pending={pending} view={view} /> : null}
    </>
  );
}
