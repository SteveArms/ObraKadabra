"use client";

import { useId } from "react";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { useEditorStore } from "../store";
import type { LayerMode } from "../types";

const MODES: { id: LayerMode; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "ai", label: "AI" },
  { id: "both", label: "Both" },
];

export function LayerControls() {
  const layers = useEditorStore((state) => state.layers);
  const opacity = useEditorStore((state) => state.opacity);
  const setLayers = useEditorStore((state) => state.setLayers);
  const setOpacity = useEditorStore((state) => state.setOpacity);
  const sliderId = useId();
  return (
    <div className="flex flex-wrap items-center gap-space-sm">
      <div role="group" aria-label="Show layers" className="flex items-center gap-0.5 rounded-md bg-surface-container-highest p-0.5">
        {MODES.map((mode) => (
          <ToggleButton key={mode.id} pressed={layers === mode.id} data-testid={`layers-${mode.id}`} onClick={() => setLayers(mode.id)}>
            {mode.label}
          </ToggleButton>
        ))}
      </div>
      <div className="flex items-center gap-space-xs">
        <label htmlFor={sliderId} className="text-body-sm text-on-surface-variant">
          Photo opacity
        </label>
        <input id={sliderId} type="range" min={10} max={100} step={5} value={Math.round(opacity * 100)} onChange={(event) => setOpacity(Number(event.target.value) / 100)} disabled={layers === "ai"} className="w-20 accent-primary-container" />
        <output htmlFor={sliderId} className="w-9 font-mono text-label-numeric-sm tabular-nums">
          {Math.round(opacity * 100)}%
        </output>
      </div>
    </div>
  );
}
