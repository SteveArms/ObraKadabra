"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { useTour } from "../hooks/useTour";
import { TOUR_STEPS } from "../tour";

// Non-modal: the user can try each step on the real screen while the card stays open
export function WorkspaceTour() {
  const tour = useTour();
  if (!tour.open) return null;
  return (
    <section
      aria-labelledby="tour-title"
      aria-live="polite"
      data-testid="workspace-tour"
      data-step={tour.index + 1}
      className={cn(GLASS_SURFACE, "fixed right-gutter bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex w-[min(22rem,calc(100%-2rem))] flex-col gap-space-xs p-space-sm shadow-overlay lg:right-gutter-desktop lg:bottom-6")}
    >
      <div className="flex items-center justify-between gap-space-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 font-mono text-label-numeric-sm font-semibold text-on-tertiary-fixed">
          <Icon name="auto_awesome" size={14} />
          Step {tour.index + 1} of {TOUR_STEPS.length}
        </span>
        <button type="button" onClick={tour.skip} className="min-h-11 rounded-md px-space-xs text-body-sm font-medium text-on-surface-variant hover:text-on-surface">
          Skip
        </button>
      </div>
      <h2 id="tour-title" className="flex items-center gap-space-xs font-display text-body-lg font-semibold">
        <Icon name={tour.step.icon} className="text-primary" />
        {tour.step.title}
      </h2>
      <p className="text-body-md text-pretty text-on-surface">{tour.step.text}</p>
      <div className="flex items-center justify-between gap-space-sm">
        <div aria-hidden="true" className="flex gap-1">
          {TOUR_STEPS.map((step, index) => (
            <span key={step.title} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out", index === tour.index ? "w-4 bg-primary" : "w-1.5 bg-outline-variant")} />
          ))}
        </div>
        <Button onClick={tour.next} className="min-h-11">
          {tour.last ? "Got it" : "Next"}
          {tour.last ? null : <Icon name="arrow_forward" size={18} />}
        </Button>
      </div>
    </section>
  );
}
