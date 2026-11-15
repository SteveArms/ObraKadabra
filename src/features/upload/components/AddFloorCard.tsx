"use client";

import { Icon } from "@/components/ui/Icon";
import { FileButton } from "./FileButton";

type AddFloorCardProps = {
  nextFloor: number;
  busy: boolean;
  onFile: (file: File | undefined) => void;
};

export function AddFloorCard({ nextFloor, busy, onFile }: AddFloorCardProps) {
  return (
    <div className="flex flex-col items-start gap-space-md rounded-lg bg-surface-container-low p-space-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-space-md">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          <Icon name="layers" size={28} />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-headline-sm text-balance">Plans for more than one floor?</p>
          <p className="text-body-md text-pretty text-on-surface-variant">Add each floor as its own file. Floors without a plan repeat the one below.</p>
        </div>
      </div>
      <FileButton label={`Add floor ${nextFloor} plan`} icon="add_photo_alternate" onFile={onFile} disabled={busy} testId="add-floor-input" className="w-full shrink-0 sm:w-auto" />
    </div>
  );
}
