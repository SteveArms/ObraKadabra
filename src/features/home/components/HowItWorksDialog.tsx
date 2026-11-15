"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const STEPS = [
  "Upload a clear photo of your floor plan.",
  "Review the walls, openings and columns the AI detected.",
  "Move the timeline to watch your home being built with its cost.",
];

export function HowItWorksDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button variant="ghost" className="min-h-12 px-space-lg text-body-lg" onClick={() => dialogRef.current?.showModal()}>
        <Icon name="play_circle" className="text-primary" />
        See how it works
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="how-it-works-title"
        data-testid="how-it-works-dialog"
        className="m-auto w-[min(36rem,calc(100%-2rem))] rounded-xl bg-surface-container-lowest p-space-lg text-on-surface backdrop:bg-inverse-surface/60"
      >
        <div className="flex flex-col gap-space-md">
          <h2 id="how-it-works-title" className="font-display text-headline-md">
            How ObraKadabra works
          </h2>
          <ol className="flex list-decimal flex-col gap-space-xs ps-5 text-body-lg">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="text-body-md text-on-surface-variant">A 2-minute video walkthrough is on its way.</p>
          <form method="dialog" className="flex justify-end">
            <Button type="submit" variant="primary">
              Close
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
