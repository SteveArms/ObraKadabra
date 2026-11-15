"use client";

import { useShallow } from "zustand/react/shallow";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PlanImage } from "../hooks/usePlanImage";
import { useEditorStore } from "../store";
import type { Bounds } from "../types";
import { DraftLayer } from "./DraftLayer";
import { GridLayer } from "./GridLayer";
import { PlanDrawing } from "./PlanDrawing";
import { VertexHandles } from "./VertexHandles";

type CanvasSceneProps = { plan: FloorPlan; bounds: Bounds; image?: PlanImage; pixelsPerUnit: number; transform: string; pendingIds: Set<string> };

// Bottom to top: paper, the photo, the grid, the AI drawing with its corner handles, then whatever is being drawn
export function CanvasScene({ plan, bounds, image, pixelsPerUnit, transform, pendingIds }: CanvasSceneProps) {
  const { level, layers, opacity, selected, tool } = useEditorStore(useShallow(({ level, layers, opacity, selected, tool }) => ({ level, layers, opacity, selected, tool })));
  return (
    <g transform={transform}>
      <rect x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} className="fill-surface-container-lowest" />
      <g data-testid="layer-original" className={layers === "ai" ? "hidden" : undefined}>
        {image ? <image href={image.url} width={image.width} height={image.height} opacity={opacity} preserveAspectRatio="none" /> : null}
      </g>
      <GridLayer bounds={bounds} scale={plan.meta.scale} pixelsPerUnit={pixelsPerUnit} />
      <g data-testid="layer-ai" className={layers === "original" ? "hidden" : undefined}>
        <PlanDrawing plan={plan} level={level} pixelsPerUnit={pixelsPerUnit} pendingIds={pendingIds} selected={selected} />
        {tool === "select" || tool === "vertex" ? <VertexHandles plan={plan} level={level} pixelsPerUnit={pixelsPerUnit} /> : null}
      </g>
      <DraftLayer scale={plan.meta.scale} pixelsPerUnit={pixelsPerUnit} />
    </g>
  );
}
