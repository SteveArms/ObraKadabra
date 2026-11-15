"use client";

import { Icon } from "@/components/ui/Icon";
import { PROCESSING_STEPS } from "@/schemas/plan-extraction";
import { usePlanProcessing } from "../hooks/usePlanProcessing";
import { STEP_LABELS, stepStatus } from "../progress";
import { DidYouKnow } from "./DidYouKnow";
import { NothingToProcess, ProcessingFailure } from "./ProcessingFailure";
import { ProcessingSteps } from "./ProcessingSteps";

const TITLES = { running: "Raising your home in 3D…", done: "Your plan is ready", failed: "We could not read this plan", empty: "There is no plan to read" };

export function ProcessingView() {
  const { phase, progress, error, retry } = usePlanProcessing();
  const finished = progress.done.length;
  const current = PROCESSING_STEPS.find((step) => stepStatus(progress, step, phase === "failed") === "active");
  return (
    <div data-testid="processing" data-phase={phase} className="mx-auto flex w-full max-w-3xl flex-col gap-space-lg px-gutter py-space-xl">
      <div className="flex flex-col items-center gap-space-sm text-center">
        <p className="flex items-center gap-1.5 rounded-full bg-ai-tint px-space-sm py-1 font-mono text-label-numeric-sm tracking-[0.05em] text-ai-strong uppercase">
          <Icon name="auto_awesome" size={16} />
          AI plan reader
        </p>
        <h1 className="font-display text-headline-lg-mobile text-balance md:text-display-lg">{TITLES[phase]}</h1>
        <p role="status" className="max-w-[60ch] text-body-lg text-pretty text-on-surface-variant">
          {phase === "running" && current ? `${STEP_LABELS[current]}…` : null}
          {phase === "done" ? "Opening the editor so you can review what the AI found." : null}
        </p>
      </div>
      {phase === "empty" ? (
        <NothingToProcess />
      ) : (
        <section aria-labelledby="pipeline-title" className="flex flex-col gap-space-md rounded-lg border border-line bg-surface-container-lowest p-space-lg">
          <ProgressBar finished={finished} />
          <ProcessingSteps progress={progress} failed={phase === "failed"} />
          {phase === "failed" ? <ProcessingFailure message={error} onRetry={retry} /> : null}
        </section>
      )}
      {phase !== "empty" ? <DidYouKnow /> : null}
    </div>
  );
}

function ProgressBar({ finished }: { finished: number }) {
  const total = PROCESSING_STEPS.length;
  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-baseline justify-between gap-space-sm">
        <h2 id="pipeline-title" className="font-display text-headline-sm">Reading your plan</h2>
        <span className="font-mono text-label-numeric-md text-primary">{finished} of {total}</span>
      </div>
      <div role="progressbar" aria-label="Steps finished" aria-valuemin={0} aria-valuemax={total} aria-valuenow={finished} className="h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container transition-[width] duration-500 ease-out" style={{ width: `${(finished / total) * 100}%` }} />
      </div>
    </div>
  );
}
