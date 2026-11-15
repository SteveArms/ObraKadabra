"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MAX_SHEETS, useSheetFiles } from "../hooks/useSheetFiles";
import { useUploadStore } from "../store";
import { AddFloorCard } from "./AddFloorCard";
import { FileButton } from "./FileButton";
import { NextStepHint } from "./NextStepHint";
import { PhotoTips } from "./PhotoTips";
import { PlanDropzone } from "./PlanDropzone";
import { SheetPreview } from "./SheetPreview";
import { SheetTabs } from "./SheetTabs";

export function UploadStep() {
  const sheets = useUploadStore((state) => state.sheets);
  const activeId = useUploadStore((state) => state.activeId);
  const removeSheet = useUploadStore((state) => state.removeSheet);
  const files = useSheetFiles();
  const index = sheets.findIndex((sheet) => sheet.id === activeId);
  const active = sheets[index];

  return (
    <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
      <div className="flex min-w-0 flex-col gap-space-md">
        <SheetTabs />
        {active ? (
          <SheetPreview
            key={active.id}
            sheet={active}
            floor={index + 1}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-line px-space-sm py-space-xs">
                <p className="flex items-center gap-space-xs text-body-md text-on-surface-variant">
                  <Icon name="check_circle" className="text-status-done-text" />
                  Plan ready for calibration.
                </p>
                <div className="flex gap-space-xs">
                  {sheets.length > 1 ? (
                    <Button variant="ghost" onClick={() => removeSheet(active.id)}>
                      <Icon name="delete" />
                      Remove floor {index + 1}
                    </Button>
                  ) : null}
                  <FileButton label="Replace file" icon="upload" onFile={(file) => files.load(file, active.id)} disabled={files.busy} />
                </div>
              </div>
            }
          />
        ) : (
          <PlanDropzone onFile={(file) => files.load(file)} busy={files.busy} />
        )}
        <p role="alert" className="text-body-md text-error empty:hidden">
          {files.error}
        </p>
        {active && sheets.length < MAX_SHEETS ? <AddFloorCard nextFloor={sheets.length + 1} busy={files.busy} onFile={(file) => files.load(file)} /> : null}
      </div>
      <div className="flex flex-col gap-space-lg">
        <PhotoTips />
        <NextStepHint
          step={2}
          title="Next: scale calibration"
          icon="straighten"
          text="You will mark two points of a known length, such as the 8.00 m front, so every wall is measured in meters."
        />
      </div>
    </div>
  );
}
