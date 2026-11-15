"use client";

import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";
import { Dialog } from "./Dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
  testId?: string;
};

export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel, confirmVariant = "primary", onConfirm, onCancel, testId }: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onCancel} testId={testId}>
      <div className="text-body-md text-pretty text-on-surface-variant">{children}</div>
      <div className="flex flex-wrap justify-end gap-space-sm">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
