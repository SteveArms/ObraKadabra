"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TOOLS } from "../tools";

const EDITING_KEYS = [
  { label: "Undo", keys: "Ctrl + Z" },
  { label: "Redo", keys: "Ctrl + Shift + Z" },
  { label: "Delete the selected element", keys: "Del" },
  { label: "Stop drawing or clear the selection", keys: "Esc" },
  { label: "Close the room being drawn", keys: "Enter" },
  { label: "Zoom in / out", keys: "+ / −" },
  { label: "Fit the plan to the screen", keys: "0" },
];

export function ShortcutsDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const rows = [...TOOLS.map((tool) => ({ label: tool.label, keys: tool.keyLabel })), ...EDITING_KEYS];
  return (
    <>
      <Button variant="ghost" onClick={() => ref.current?.showModal()}>
        <Icon name="keyboard" size={18} />
        <span className="max-sm:sr-only">Shortcuts</span>
      </Button>
      <dialog ref={ref} aria-labelledby="shortcuts-title" data-testid="shortcuts-dialog" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl bg-surface-container-lowest p-space-lg text-on-surface backdrop:bg-inverse-surface/60">
        <div className="flex flex-col gap-space-md">
          <h2 id="shortcuts-title" className="font-display text-headline-sm">
            Keyboard shortcuts
          </h2>
          <dl className="flex max-h-[60dvh] flex-col gap-1 overflow-y-auto overscroll-contain">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-space-md border-b border-line py-1 last:border-0">
                <dt className="text-body-md">{row.label}</dt>
                <dd>
                  <kbd className="rounded-sm bg-surface-container px-space-xs py-0.5 font-mono text-label-numeric-sm whitespace-nowrap">{row.keys}</kbd>
                </dd>
              </div>
            ))}
          </dl>
          <form method="dialog" className="flex justify-end">
            <Button type="submit">Close</Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
