"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useShallow } from "zustand/react/shallow";
import { useFullscreen } from "@/lib/hooks/useFullscreen";
import { levelCuts } from "../scene";
import { useViewerStore, visibleEntries } from "../store";
import { ViewerOverlays } from "./ViewerOverlays";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

// Compact drops the toolbar, legend and details so the same viewer can sit in a small live preview
type ViewerProps = { plan: FloorPlan; glbUrl?: string; className?: string; bottomSlot?: ReactNode; compact?: boolean };

// The container exposes the viewer state as data attributes, which is what e2e tests read instead of WebGL pixels
export function Viewer({ plan, glbUrl, className, bottomSlot, compact = false }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const cuts = useMemo(() => levelCuts(plan), [plan]);
  const { view, levelCut, selectedKey, entries, source, statuses, timeline, colorMode, reset } = useViewerStore(
    useShallow(({ view, levelCut, selectedKey, entries, source, statuses, timeline, colorMode, reset }) => ({ view, levelCut, selectedKey, entries, source, statuses, timeline, colorMode, reset })),
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
      data-visible-count={visibleEntries(entries, { levelCut, statuses, timeline }).length}
      data-week={timeline?.week ?? ""}
      data-color-mode={colorMode}
      data-ready={ready}
      data-source={source ?? ""}
      className={`relative overflow-hidden bg-viewport ${className ?? ""}`}
    >
      <ViewerCanvas plan={plan} glbUrl={glbUrl} onReady={onReady} />
      {compact ? null : <ViewerOverlays plan={plan} cuts={cuts} isFullscreen={isFullscreen} onToggleFullscreen={toggle} bottomSlot={bottomSlot} />}
    </div>
  );
}
