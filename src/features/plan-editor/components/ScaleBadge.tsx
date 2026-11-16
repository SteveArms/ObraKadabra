"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatMeters, formatScale, parseMeters } from "@/lib/format";
import { metersPerPixel } from "@/lib/geometry";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useEditorStore } from "../store";
import { MetersInput } from "@/components/ui/MetersInput";

const BADGE = "flex flex-wrap items-center gap-space-xs rounded-md bg-surface-container px-space-sm py-1 font-mono text-label-numeric-sm text-on-surface-variant";

function CalibrationForm() {
  const draft = useEditorStore((state) => state.draft);
  const commit = useEditorStore((state) => state.commit);
  const setTool = useEditorStore((state) => state.setTool);
  const [meters, setMeters] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [a, b] = draft;

  const apply = () => {
    const value = parseMeters(meters);
    const scale = a && b && value ? metersPerPixel(a, b, value) : null;
    if (!scale || !value) return setError("Enter the real distance in meters, such as 5.00.");
    commit((current) => ({ ...current, meta: { ...current.meta, scale, calibratedMeters: value } }));
    setTool("select");
  };

  if (!a || !b) return <span className={BADGE}>Click two points with a known distance on the plan ({draft.length} of 2)</span>;
  return (
    <form className="flex flex-wrap items-center gap-space-xs" onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}>
      <label htmlFor="recalibrate-meters" className="text-body-sm">Real distance</label>
      <MetersInput id="recalibrate-meters" size="sm" wrapperClassName="w-24" value={meters} onChange={(event) => setMeters(event.target.value)} invalid={Boolean(error)} aria-describedby={error ? "recalibrate-error" : undefined} placeholder="5.00" />
      <Button type="submit" className="min-h-8 text-body-sm">Apply scale</Button>
      {error ? <span id="recalibrate-error" className="text-body-sm text-error">{error}</span> : null}
    </form>
  );
}

export function ScaleBadge({ plan, readOnly }: { plan: FloorPlan; readOnly: boolean }) {
  const tool = useEditorStore((state) => state.tool);
  const setTool = useEditorStore((state) => state.setTool);
  const calibrating = tool === "calibrate";
  return (
    <div className="flex flex-wrap items-center gap-space-xs">
      <span data-testid="scale-badge" className={BADGE}>
        <Icon name="square_foot" size={16} className="text-tertiary" />
        {readOnly ? "Drawn in meters" : formatScale(plan.meta.scale)}
        {plan.meta.calibratedMeters ? (
          <>
            <span aria-hidden="true" className="text-outline">|</span>
            <span className="font-semibold text-primary">{formatMeters(plan.meta.calibratedMeters)} calibrated</span>
          </>
        ) : null}
      </span>
      {readOnly ? null : (
        <Button variant="ghost" className="min-h-8 text-body-sm" aria-pressed={calibrating} onClick={() => setTool(calibrating ? "select" : "calibrate")}>
          {calibrating ? "Cancel recalibration" : "Recalibrate"}
        </Button>
      )}
      {calibrating ? <CalibrationForm /> : null}
    </div>
  );
}
