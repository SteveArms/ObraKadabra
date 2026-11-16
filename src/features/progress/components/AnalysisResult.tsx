"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPercent, formatSoles } from "@/lib/format";
import { findingImpact } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { useProgressStore } from "../store";
import { FindingCard } from "./FindingCard";

// Findings, their total effect on the schedule and budget, and the foreman's two choices
export function AnalysisResult({ schedule, saving, onConfirm }: { schedule: Schedule; saving: boolean; onConfirm: () => void }) {
  const { findings, editing, setEditing, setStatus } = useProgressStore();
  const impacts = findings.map((finding) => findingImpact(schedule, finding));
  const top = Math.max(...impacts.map((impact) => impact.progress), 1e-9);
  const total = impacts.reduce((sum, impact) => ({ progress: sum.progress + impact.progress, value: sum.value + impact.value }), { progress: 0, value: 0 });
  return (
    <>
      <ul className="flex flex-col gap-space-xs">
        {findings.map((finding, index) => (
          <FindingCard key={finding.elementId} finding={finding} index={index} impact={impacts[index]} share={impacts[index].progress / top} editing={editing} onStatus={(status) => setStatus(finding.elementId, status)} />
        ))}
      </ul>
      <p data-testid="analysis-total" className="flex flex-wrap justify-between gap-space-xs rounded-lg bg-surface-container-low p-space-sm font-mono text-label-numeric-md tabular-nums">
        <span>Schedule impact: +{formatPercent(total.progress)}</span>
        <span>Estimated value: {formatSoles(total.value)}</span>
      </p>
      <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
        <Icon name="lock" size={16} />
        The AI proposes, the site foreman approves.
      </p>
      <div className="grid gap-space-xs sm:grid-cols-2">
        <Button variant="success" className="min-h-12 font-semibold" onClick={onConfirm} disabled={saving}>
          <Icon name="verified" />
          Confirm and update 3D model
        </Button>
        <Button variant="ghost" className="min-h-12" aria-pressed={editing} onClick={() => setEditing(!editing)}>
          <Icon name="edit_note" />
          {editing ? "Done correcting" : "Fix details manually"}
        </Button>
      </div>
    </>
  );
}
