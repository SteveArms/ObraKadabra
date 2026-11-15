"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { cn } from "@/lib/cn";
import { ZOOM_LIMITS } from "../constants";
import { useEditorStore } from "../store";
import type { CanvasView } from "../hooks/useCanvasView";

type CanvasToolbarProps = { view: CanvasView; levels: number; isFullscreen: boolean; onToggleFullscreen: () => void };

function ToolbarButton({ label, icon, onClick, disabled, shortcut }: { label: string; icon: string; onClick: () => void; disabled?: boolean; shortcut?: string }) {
  return (
    <button type="button" aria-label={label} title={shortcut ? `${label} (${shortcut})` : label} aria-keyshortcuts={shortcut} onClick={onClick} disabled={disabled} className="flex size-9 items-center justify-center rounded-md text-on-surface-variant transition-[background-color] duration-150 hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40">
      <Icon name={icon} size={18} />
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-line" />;

function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

export function CanvasToolbar({ view, levels, isFullscreen, onToggleFullscreen }: CanvasToolbarProps) {
  const canUndo = useEditorStore((state) => state.past.length > 0);
  const canRedo = useEditorStore((state) => state.future.length > 0);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const level = useEditorStore((state) => state.level);
  const setLevel = useEditorStore((state) => state.setLevel);
  return (
    <div role="toolbar" aria-label="Canvas" className={cn(GLASS_SURFACE, "flex flex-wrap items-center gap-0.5 p-1")}>
      <Group>
        <ToolbarButton label="Undo" icon="undo" shortcut="Control+Z" onClick={undo} disabled={!canUndo} />
        <ToolbarButton label="Redo" icon="redo" shortcut="Control+Shift+Z" onClick={redo} disabled={!canRedo} />
      </Group>
      <Divider />
      <Group>
        <ToolbarButton label="Zoom out" icon="zoom_out" shortcut="-" onClick={() => view.zoomAt(1 / ZOOM_LIMITS.step)} />
        <span data-testid="zoom-level" className="w-12 text-center font-mono text-label-numeric-sm tabular-nums">
          {Math.round(view.zoom * 100)}%
        </span>
        <ToolbarButton label="Zoom in" icon="zoom_in" shortcut="+" onClick={() => view.zoomAt(ZOOM_LIMITS.step)} />
        <ToolbarButton label="Fit plan to screen" icon="fit_screen" shortcut="0" onClick={view.reset} />
        <ToolbarButton label={isFullscreen ? "Exit full screen" : "Full screen"} icon={isFullscreen ? "fullscreen_exit" : "fullscreen"} onClick={onToggleFullscreen} />
      </Group>
      <Divider />
      <span className="flex items-center gap-1 rounded-sm bg-tertiary-fixed px-space-xs py-1 font-mono text-label-numeric-sm text-on-tertiary-fixed">
        <Icon name="grid_4x4" size={14} />
        Grid 0.05 m
      </span>
      {levels > 1 ? (
        <div role="group" aria-label="Floor" className="ms-1 flex items-center gap-0.5">
          {Array.from({ length: levels }, (_, index) => index + 1).map((item) => (
            <ToggleButton key={item} pressed={item === level} onClick={() => setLevel(item)}>
              Floor {item}
            </ToggleButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}
