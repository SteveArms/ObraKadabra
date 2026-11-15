"use client";

import { useRef, type ReactNode } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useOverlayInsets } from "../hooks/useOverlayInsets";
import { CoordinatesBadge } from "./CoordinatesBadge";
import { ElementPopover } from "./ElementPopover";
import { SourceNotice } from "./SourceNotice";
import { ViewerLegend } from "./ViewerLegend";
import { ViewerToolbar } from "./ViewerToolbar";

type ViewerOverlaysProps = {
  plan: FloorPlan;
  cuts: number[];
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  bottomSlot?: ReactNode;
};

// One column over the canvas: details sit under the legend on desktop and drop to a bottom sheet on mobile
export function ViewerOverlays({ plan, cuts, isFullscreen, onToggleFullscreen, bottomSlot }: ViewerOverlaysProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useOverlayInsets(topRef, bottomRef);
  return (
      <div className="pointer-events-none absolute inset-space-sm z-10 flex flex-col gap-space-xs">
        <div ref={topRef} className="flex flex-col gap-space-xs">
          <ViewerToolbar cuts={cuts} isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />
          <ViewerLegend />
          <SourceNotice />
        </div>
        <div className="pointer-events-auto flex min-h-0 max-w-full self-start max-sm:mt-auto">
          <ElementPopover plan={plan} />
        </div>
        <div ref={bottomRef} className="flex flex-wrap items-end justify-between gap-space-xs sm:mt-auto">
          <div className="max-sm:hidden">
            <CoordinatesBadge />
          </div>
          {bottomSlot ? <div className="pointer-events-auto max-sm:w-full">{bottomSlot}</div> : null}
        </div>
      </div>
  );
}
