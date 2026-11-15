"use client";

import { useUploadStore } from "../store";
import { sheetScale } from "../utils";
import { CalibrationPanel } from "./CalibrationPanel";
import { PointPicker } from "./PointPicker";
import { SheetTabs } from "./SheetTabs";

export function CalibrateStep() {
  const sheets = useUploadStore((state) => state.sheets);
  const activeId = useUploadStore((state) => state.activeId);
  const setPoints = useUploadStore((state) => state.setPoints);
  const index = Math.max(0, sheets.findIndex((sheet) => sheet.id === activeId));
  const sheet = sheets[index];
  if (!sheet) return null;
  const points = sheet.calibration.points;

  return (
    <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
      <div className="flex min-w-0 flex-col gap-space-md">
        <SheetTabs statusFor={(id) => (sheets.some((item) => item.id === id && sheetScale(item)) ? "calibrated" : null)} />
        <div className="-mx-gutter bg-surface-container p-1 sm:mx-0 sm:rounded-lg sm:border sm:border-line sm:p-space-sm">
          <PointPicker
            image={sheet.image}
            points={points}
            shape="line"
            label={`Floor ${index + 1} plan, calibration points`}
            instructions="Click or tap to place point A, then point B. A third click starts again. With a keyboard, move with the arrow keys and press Enter."
            onPick={(point) => setPoints(sheet.id, points.length < 2 ? [...points, point] : [point])}
            testId="calibration-image"
          />
        </div>
      </div>
      <CalibrationPanel sheet={sheet} />
    </div>
  );
}
