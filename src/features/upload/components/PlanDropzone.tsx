"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { FileButton } from "./FileButton";

type PlanDropzoneProps = {
  onFile: (file: File | undefined) => void;
  busy: boolean;
};

export function PlanDropzone({ onFile, busy }: PlanDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      data-testid="plan-dropzone"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFile(event.dataTransfer.files[0]);
      }}
      className={cn(
        "flex min-h-80 flex-col items-center justify-center gap-space-md rounded-lg border-2 border-dashed p-space-lg text-center transition-colors duration-150",
        dragging ? "border-primary-container bg-primary-fixed/40" : "border-outline-variant bg-surface-container-low",
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-xl bg-primary-fixed text-primary">
        <Icon name={busy ? "progress_activity" : "upload_file"} size={32} className={busy ? "motion-safe:animate-spin" : undefined} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-headline-sm text-balance">{busy ? "Preparing your plan…" : "Add a photo or PDF of your plan"}</p>
        <p className="text-body-md text-pretty text-on-surface-variant">Drag it here, choose a file or take a photo. JPG, PNG or PDF up to 25 MB.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-space-sm">
        <FileButton label="Choose file" icon="folder_open" variant="primary" onFile={onFile} disabled={busy} testId="plan-file-input" />
        <FileButton label="Take photo" icon="photo_camera" onFile={onFile} capture disabled={busy} />
      </div>
    </div>
  );
}
