"use client";

import { FailureNotice } from "@/components/layout/FailureNotice";
import { Icon } from "@/components/ui/Icon";
import type { Schedule } from "@/schemas/schedule";
import { useProgressStore } from "../store";
import { AnalysisResult } from "./AnalysisResult";

type AnalysisPanelProps = { schedule: Schedule; expectedCount: number; saving: boolean; onConfirm: () => void; onRetry: () => void };

function Placeholder({ icon, children, role, spinning = false }: { icon: string; children: string; role?: "status" | "alert"; spinning?: boolean }) {
  return (
    <p role={role} className="flex items-center gap-space-xs rounded-lg bg-surface-container p-space-md text-body-md text-pretty text-on-surface-variant">
      <Icon name={icon} className={spinning ? "motion-safe:animate-spin" : undefined} />
      {children}
    </p>
  );
}

export function AnalysisPanel({ schedule, expectedCount, saving, onConfirm, onRetry }: AnalysisPanelProps) {
  const analysis = useProgressStore((state) => state.analysis);
  return (
    <section aria-labelledby="analysis-title" data-testid="analysis-panel" data-state={analysis.status} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-float">
      <h2 id="analysis-title" className="flex items-center gap-space-xs font-display text-headline-sm">
        <Icon name="auto_awesome" className="text-ai-strong" />
        AI analysis
      </h2>
      {analysis.status === "idle" ? <Placeholder icon="photo_camera">{`Add a photo and the AI will check it against the ${expectedCount} elements planned for this area.`}</Placeholder> : null}
      {analysis.status === "loading" ? (
        <div className="flex flex-col gap-space-xs">
          <Placeholder icon="progress_activity" role="status" spinning>Comparing the photo with the planned elements. This usually takes 10 to 30 seconds…</Placeholder>
          <div aria-hidden="true" className="ai-sheen h-1 rounded-full" />
        </div>
      ) : null}
      {analysis.status === "error" ? <FailureNotice message={analysis.message} kind={analysis.kind ?? "request"} onRetry={onRetry} testId="analysis-error" /> : null}
      {analysis.status === "done" ? <AnalysisResult schedule={schedule} saving={saving} onConfirm={onConfirm} /> : null}
    </section>
  );
}
