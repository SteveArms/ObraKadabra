"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";

const STEPS = [
  "Upload a clear photo of your floor plan.",
  "Review the walls, openings and columns the AI detected.",
  "Move the timeline to watch your home being built with its cost.",
  "Log progress with a site photo and share a link with your family.",
];

export function HowItWorksDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" className="min-h-12 px-space-lg text-body-lg" onClick={() => setOpen(true)}>
        <Icon name="play_circle" className="text-primary" />
        See how it works
      </Button>
      <Dialog open={open} title="How ObraKadabra works" onClose={() => setOpen(false)} testId="how-it-works-dialog" wide>
        <ol className="flex list-decimal flex-col gap-space-xs ps-5 text-body-lg">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-body-md text-on-surface-variant">Try it now with a demo home. No account and no plan needed.</p>
        <div className="flex flex-wrap justify-end gap-space-sm">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Link href={`/proyecto/${DEFAULT_PROJECT_ID}`} className={buttonClasses("primary")}>
            <Icon name="view_in_ar" />
            Open a demo
          </Link>
        </div>
      </Dialog>
    </>
  );
}
