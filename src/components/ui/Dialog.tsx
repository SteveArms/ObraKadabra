"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = { open: boolean; title: string; onClose: () => void; children: ReactNode; testId?: string; wide?: boolean };

// Native modal dialog: the page behind turns inert, Escape closes it and focus returns to the trigger
export function Dialog({ open, title, onClose, children, testId, wide = false }: DialogProps) {
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
      onClose={() => open && onClose()}
      className={`m-auto ${wide ? "w-[min(36rem,calc(100%-2rem))]" : "w-[min(28rem,calc(100%-2rem))]"} rounded-xl bg-surface-container-lowest p-space-lg text-on-surface backdrop:bg-inverse-surface/60`}
    >
      <div className="flex flex-col gap-space-md">
        <h2 id={titleId} className="font-display text-headline-sm text-balance">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
