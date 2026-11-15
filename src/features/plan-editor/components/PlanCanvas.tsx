"use client";

import { useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFullscreen } from "@/lib/hooks/useFullscreen";
import { pendingElements } from "@/lib/plan";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useCanvasPointer } from "../hooks/useCanvasPointer";
import { useCanvasControls } from "../hooks/useCanvasControls";
import { useCanvasView } from "../hooks/useCanvasView";
import type { PlanImage } from "../hooks/usePlanImage";
import { useEditorStore } from "../store";
import { planBounds } from "../utils";
import { CanvasOverlays } from "./CanvasOverlays";
import { CanvasScene } from "./CanvasScene";

type PlanCanvasProps = { plan: FloorPlan; savedPlan: FloorPlan; image?: PlanImage; readOnly: boolean };

// The frame comes from the saved plan (or the photo), so dragging a corner never re-fits the view under the cursor
export function PlanCanvas({ plan, savedPlan, image, readOnly }: PlanCanvasProps) {
  const { level, layers, selected, tool } = useEditorStore(useShallow(({ level, layers, selected, tool }) => ({ level, layers, selected, tool })));
  const bounds = useMemo(() => planBounds(savedPlan, level, image), [savedPlan, level, image]);
  const containerRef = useRef<HTMLDivElement>(null);
  const view = useCanvasView(containerRef, bounds);
  const pointer = useCanvasPointer(view);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const pending = useMemo(() => pendingElements(plan), [plan]);
  const pendingIds = useMemo(() => new Set(pending.map((item) => item.id)), [pending]);

  useCanvasControls(view, pointer);

  return (
    <div
      ref={containerRef}
      data-testid="plan-canvas"
      data-layers={layers}
      data-tool={tool}
      data-zoom={view.zoom.toFixed(2)}
      data-selected-id={selected?.id ?? ""}
      data-pending-count={pending.length}
      className="relative h-full min-h-0 overflow-hidden bg-surface-dim select-none"
    >
      <svg
        role="img"
        aria-label="Floor plan drawing"
        className={`absolute inset-0 size-full touch-none ${tool === "select" || tool === "vertex" ? "cursor-grab" : "cursor-crosshair"}`}
        onPointerDown={pointer.onPointerDown}
        onPointerMove={pointer.onPointerMove}
        onPointerUp={pointer.onPointerUp}
        onPointerCancel={pointer.onPointerUp}
        onPointerLeave={pointer.onPointerLeave}
      >
        {view.ready ? <CanvasScene plan={plan} bounds={bounds} image={image} pixelsPerUnit={view.scale} transform={view.transform} pendingIds={pendingIds} /> : null}
      </svg>
      <CanvasOverlays plan={plan} pending={pending} view={view} notice={pointer.notice} hasPhoto={Boolean(image)} readOnly={readOnly} isFullscreen={isFullscreen} onToggleFullscreen={toggle} />
    </div>
  );
}
