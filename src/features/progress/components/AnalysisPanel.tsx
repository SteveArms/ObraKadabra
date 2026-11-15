"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Schedule } from "@/schemas/schedule";
import { useProgressStore } from "../store";
import { AnalysisResult } from "./AnalysisResult";

type AnalysisPanelProps = { schedule: Schedule; expectedCount: number; saving: boolean; onConfirm: () => void; onRetry: () => void };

function Placeholder({ icon, children, role }: { icon: string; children: string; role?: "status" | "alert" }) {
  return (
    <p role={role} className="flex items-center gap-space-xs rounded-lg bg-surface-container p-space-md text-body-md text-pretty text-on-surface-variant">
      <Icon name={icon} />
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
      {analysis.status === "loading" ? <Placeholder icon="progress_activity" role="status">Comparing the photo with the planned elements…</Placeholder> : null}
      {analysis.status === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-space-xs rounded-lg bg-error-container p-space-md text-body-md text-on-error-container">
          {analysis.message}
          <Button variant="ghost" onClick={onRetry}>Try again</Button>
        </div>
      ) : null}
      {analysis.status === "done" ? <AnalysisResult schedule={schedule} saving={saving} onConfirm={onConfirm} /> : null}
    </section>
  );
}
