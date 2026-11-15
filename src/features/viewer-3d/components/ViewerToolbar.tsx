"use client";

import { Icon } from "@/components/ui/Icon";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { levelLabel } from "../scene";
import { useShallow } from "zustand/react/shallow";
import { useViewerStore, type NavMode, type ViewMode } from "../store";
import { ElementPicker } from "./ElementPicker";

const NAV_MODES: { mode: NavMode; label: string; icon: string }[] = [
  { mode: "orbit", label: "Orbit", icon: "3d_rotation" },
  { mode: "pan", label: "Pan", icon: "pan_tool" },
  { mode: "zoom", label: "Zoom", icon: "zoom_in" },
];

const VIEWS: { view: ViewMode; label: string }[] = [
  { view: "top", label: "Top" },
  { view: "iso", label: "Isometric" },
  { view: "front", label: "Front" },
];

export const GLASS = "pointer-events-auto rounded-lg bg-surface/90 shadow-float backdrop-blur-md";

type ViewerToolbarProps = { cuts: number[]; isFullscreen: boolean; onToggleFullscreen: () => void };

export function ViewerToolbar({ cuts, isFullscreen, onToggleFullscreen }: ViewerToolbarProps) {
  const { navMode, view, levelCut, setNavMode, setView, setLevelCut } = useViewerStore(
    useShallow(({ navMode, view, levelCut, setNavMode, setView, setLevelCut }) => ({ navMode, view, levelCut, setNavMode, setView, setLevelCut })),
  );
  return (
    <div className="flex flex-wrap items-start justify-between gap-space-xs">
      <div role="toolbar" aria-label="Camera" className={`${GLASS} flex flex-wrap items-center gap-0.5 p-1`}>
        {NAV_MODES.map((item) => (
          <ToggleButton key={item.mode} pressed={navMode === item.mode} onClick={() => setNavMode(item.mode)} aria-label={item.label}>
            <Icon name={item.icon} size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </ToggleButton>
        ))}
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-outline-variant" />
        {VIEWS.map((item) => (
          <ToggleButton key={item.view} pressed={view === item.view} onClick={() => setView(item.view)}>
            {item.label}
          </ToggleButton>
        ))}
      </div>
      <div role="toolbar" aria-label="Level cuts" className={`${GLASS} flex flex-wrap items-center gap-0.5 p-1`}>
        <span className="hidden px-1 text-body-sm text-on-surface-variant sm:inline">Cut</span>
        {cuts.map((level) => (
          <ToggleButton key={level} pressed={levelCut === level} onClick={() => setLevelCut(level)}>
            {levelLabel(level)}
          </ToggleButton>
        ))}
        <ToggleButton pressed={isFullscreen} onClick={onToggleFullscreen} aria-label="Full screen">
          <Icon name={isFullscreen ? "fullscreen_exit" : "fullscreen"} size={18} />
        </ToggleButton>
        <ElementPicker />
      </div>
    </div>
  );
}
