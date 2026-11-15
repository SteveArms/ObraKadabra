"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type ToolProps = { label: string; icon: string; onClick: () => void; pressed?: boolean; disabled?: boolean };

function Tool({ label, icon, onClick, pressed, disabled }: ToolProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-50",
        pressed ? "bg-primary-container text-on-primary" : "text-on-surface hover:bg-surface-container-high",
      )}
    >
      <Icon name={icon} />
    </button>
  );
}

type SheetToolbarProps = {
  fileName: string;
  busy: boolean;
  contrast: boolean;
  cropping: boolean;
  edited: boolean;
  onRotate: () => void;
  onContrast: () => void;
  onCrop: () => void;
  onReset: () => void;
};

export function SheetToolbar({ fileName, busy, contrast, cropping, edited, onRotate, onContrast, onCrop, onReset }: SheetToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-xs border-b border-line px-space-sm py-space-xs">
      <p className="flex min-w-0 items-center gap-space-xs text-body-md font-medium">
        <Icon name="description" className="text-primary" />
        <span className="truncate" title={fileName}>
          {fileName}
        </span>
      </p>
      <div role="toolbar" aria-label="Edit plan photo" className="flex items-center gap-1">
        <Tool label="Rotate 90° clockwise" icon="rotate_right" onClick={onRotate} disabled={busy || cropping} />
        <Tool label="Boost contrast" icon="contrast" onClick={onContrast} pressed={contrast} disabled={busy || cropping} />
        <Tool label="Crop" icon="crop" onClick={onCrop} pressed={cropping} disabled={busy} />
        <Tool label="Undo all edits" icon="restart_alt" onClick={onReset} disabled={busy || cropping || !edited} />
      </div>
    </div>
  );
}
