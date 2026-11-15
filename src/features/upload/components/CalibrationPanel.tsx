"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useUploadStore } from "../store";
import type { Sheet } from "../types";
import { formatScale, sheetScale } from "../utils";

export function CalibrationPanel({ sheet }: { sheet: Sheet }) {
  const inputId = useId();
  const hintId = useId();
  const setMeters = useUploadStore((state) => state.setMeters);
  const setPoints = useUploadStore((state) => state.setPoints);
  const scale = sheetScale(sheet);
  const placed = sheet.calibration.points.length;

  return (
    <section aria-labelledby="calibration-title" className="flex flex-col gap-space-md rounded-lg border border-line bg-surface-container-lowest p-space-lg">
      <h2 id="calibration-title" className="flex items-center gap-space-xs font-display text-headline-sm">
        <Icon name="straighten" className="text-primary" />
        Set the scale
      </h2>
      <ol className="flex list-decimal flex-col gap-space-xs ps-5 text-body-md text-pretty text-on-surface-variant">
        <li>Click or tap both ends of a length you know, like a dimension line or the front of the house.</li>
        <li>Type the real distance between points A and B.</li>
      </ol>
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-body-md font-medium">
          Real distance between A and B
        </label>
        <div className="flex items-center rounded-md border border-outline-variant bg-surface-container-lowest focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-container">
          <input
            id={inputId}
            name="calibration-distance"
            inputMode="decimal"
            autoComplete="off"
            placeholder="8.00"
            aria-describedby={hintId}
            value={sheet.calibration.meters}
            onChange={(event) => setMeters(sheet.id, event.target.value)}
            className="min-h-11 w-full min-w-0 bg-transparent px-space-sm font-mono text-body-lg outline-none"
          />
          <span className="pe-space-sm font-mono text-body-md text-on-surface-variant">m</span>
        </div>
        <p id={hintId} className="text-body-sm text-on-surface-variant">
          Use the longest dimension you can find; small errors shrink with distance.
        </p>
      </div>
      <ScaleReadout scale={scale} placed={placed} />
      <Button variant="ghost" onClick={() => setPoints(sheet.id, [])} disabled={placed === 0} className="self-start">
        <Icon name="restart_alt" />
        Clear points
      </Button>
    </section>
  );
}

function ScaleReadout({ scale, placed }: { scale: number | null; placed: number }) {
  return (
    <div role="status" data-testid="calibration-scale" className="flex min-h-14 items-center gap-space-sm rounded-md bg-surface-container-low px-space-sm py-space-xs">
      <Icon name={scale ? "check_circle" : "pending"} className={scale ? "text-status-done-text" : "text-on-surface-variant"} />
      <p className="flex flex-col">
        <span className="font-mono text-label-numeric-md">{scale ? formatScale(scale) : `${placed} of 2 points placed`}</span>
        <span className="text-body-sm text-on-surface-variant">{scale ? "Scale set. Walls will be measured in meters." : "The scale appears once both points and the distance are in."}</span>
      </p>
    </div>
  );
}
