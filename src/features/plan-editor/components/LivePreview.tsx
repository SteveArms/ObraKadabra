"use client";

import { useMemo } from "react";
import { Viewer } from "@/features/viewer-3d";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { withDerivedStructure } from "@/lib/plan";
import { useEditorStore } from "../store";

// Waits for a pause in editing before rebuilding the model, so dragging a corner stays smooth
const DEBOUNCE_MS = 400;

// The same viewer as the workspace, compact; only mounted on wide screens, where it fits beside the plan
export function LivePreview({ readOnly }: { readOnly: boolean }) {
  const wide = useMediaQuery("(min-width: 64rem)");
  const plan = useDebouncedValue(useEditorStore((state) => state.plan), DEBOUNCE_MS);
  const preview = useMemo(() => (plan && !readOnly ? withDerivedStructure(plan) : plan), [plan, readOnly]);
  if (!wide || !preview) return null;
  return (
    <section aria-label="Live 3D preview" className="pointer-events-auto w-72 overflow-hidden rounded-xl bg-surface-container-lowest shadow-overlay">
      <h2 className="flex items-center gap-1.5 bg-inverse-surface px-space-sm py-1 font-mono text-label-numeric-sm tracking-[0.05em] text-inverse-on-surface uppercase">
        <span aria-hidden="true" className="size-2 rounded-full bg-status-done" />
        Live 3D
      </h2>
      <Viewer plan={preview} compact className="h-44" />
    </section>
  );
}
