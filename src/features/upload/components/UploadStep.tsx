"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useBlurCheck } from "../hooks/useBlurCheck";
import { MAX_SHEETS, useSheetFiles } from "../hooks/useSheetFiles";
import { useUploadStore } from "../store";
import { AddFloorCard } from "./AddFloorCard";
import { FileButton } from "@/components/ui/FileButton";
import { PLAN_FILE_ACCEPT } from "../utils";
import { NextStepHint } from "./NextStepHint";
import { PhotoTips } from "./PhotoTips";
import { PlanDropzone } from "./PlanDropzone";
import { SheetPreview } from "./SheetPreview";
import { SheetTabs } from "./SheetTabs";

type SheetFooterProps = { image: Blob; floor: number; canRemove: boolean; busy: boolean; onRemove: () => void; onReplace: (file: File | undefined) => void };

function SheetStatus({ image }: { image: Blob }) {
  const blurry = useBlurCheck(image);
  if (blurry) {
    return (
      <p role="status" data-testid="blurry-warning" className="flex items-start gap-space-xs text-body-md text-pretty text-on-surface">
        <Icon name="blur_on" className="mt-0.5 shrink-0 text-status-warning" />
        This photo looks blurry, so the AI may misread some walls. Retake it in good light, or continue and fix it in the editor.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-space-xs text-body-md text-on-surface-variant">
      <Icon name="check_circle" className="text-status-done-text" />
      Plan ready for calibration.
    </p>
  );
}

function SheetFooter({ image, floor, canRemove, busy, onRemove, onReplace }: SheetFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-line px-space-sm py-space-xs">
      <SheetStatus image={image} />
      <div className="flex gap-space-xs">
        {canRemove ? (
          <Button variant="ghost" onClick={onRemove}>
            <Icon name="delete" />
            Remove floor {floor}
          </Button>
        ) : null}
        <FileButton label="Replace file" icon="upload" accept={PLAN_FILE_ACCEPT} onFile={onReplace} disabled={busy} />
      </div>
    </div>
  );
}

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
            footer={<SheetFooter image={active.image.blob} floor={index + 1} canRemove={sheets.length > 1} busy={files.busy} onRemove={() => removeSheet(active.id)} onReplace={(file) => files.load(file, active.id)} />}
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
        <NextStepHint step={2} title="Next: scale calibration" icon="straighten" text="You will mark two points of a known length, such as the 8.00 m front, so every wall is measured in meters." />
      </div>
    </div>
  );
}
