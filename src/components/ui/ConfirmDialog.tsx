"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";

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

// Native modal dialog: the page behind turns inert, Escape cancels and focus returns to the trigger on close
export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel, confirmVariant = "primary", onConfirm, onCancel, testId }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      data-testid={testId}
      onClose={() => open && onCancel()}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl bg-surface-container-lowest p-space-lg text-on-surface backdrop:bg-inverse-surface/60"
    >
      <div className="flex flex-col gap-space-md">
        <h2 id={titleId} className="font-display text-headline-sm text-balance">
          {title}
        </h2>
        <div className="text-body-md text-pretty text-on-surface-variant">{children}</div>
        <div className="flex flex-wrap justify-end gap-space-sm">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
