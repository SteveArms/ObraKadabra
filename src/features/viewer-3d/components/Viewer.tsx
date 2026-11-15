"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useShallow } from "zustand/react/shallow";
import { useFullscreen } from "../hooks/useFullscreen";
import { levelCuts } from "../scene";
import { useViewerStore, visibleEntries } from "../store";
import { CoordinatesBadge } from "./CoordinatesBadge";
import { ElementPopover } from "./ElementPopover";
import { SourceNotice } from "./SourceNotice";
import { StatusLegend } from "./StatusLegend";
import { ViewerToolbar } from "./ViewerToolbar";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

type ViewerProps = { plan: FloorPlan; glbUrl?: string; className?: string };

// The container exposes the viewer state as data attributes, which is what e2e tests read instead of WebGL pixels
export function Viewer({ plan, glbUrl, className }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const cuts = useMemo(() => levelCuts(plan), [plan]);
  const { view, levelCut, selectedKey, entries, source, reset } = useViewerStore(
    useShallow(({ view, levelCut, selectedKey, entries, source, reset }) => ({ view, levelCut, selectedKey, entries, source, reset })),
  );
  const selected = entries.find((entry) => entry.key === selectedKey);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => reset(plan.meta.levels), [plan, reset]);

  return (
    <div
      ref={containerRef}
      data-testid="viewer"
      data-view={view}
      data-level-cut={levelCut}
      data-selected-id={selected?.id ?? ""}
      data-visible-count={visibleEntries(entries, levelCut).length}
      data-ready={ready}
      data-source={source ?? ""}
      className={`relative overflow-hidden bg-viewport ${className ?? ""}`}
    >
      <ViewerCanvas plan={plan} glbUrl={glbUrl} onReady={onReady} />
      <div className="pointer-events-none absolute inset-x-space-sm top-space-sm z-10 flex flex-col gap-space-xs">
        <ViewerToolbar cuts={cuts} isFullscreen={isFullscreen} onToggleFullscreen={toggle} />
        <StatusLegend />
        <SourceNotice />
      </div>
      <div className="pointer-events-none absolute inset-x-space-sm bottom-space-sm z-10 flex flex-col items-start gap-space-xs">
        <div className="pointer-events-auto max-w-full">
          <ElementPopover plan={plan} />
        </div>
        <CoordinatesBadge />
      </div>
    </div>
  );
}
