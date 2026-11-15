"use client";

import { useId } from "react";
import { Icon } from "@/components/ui/Icon";
import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatPercent, formatSoles } from "@/lib/format";
import type { ProgressFinding, ReportedStatus } from "@/schemas/progress";

const LOOK: Record<ReportedStatus, { icon: string; surface: string; text: string; bar: string }> = {
  done: { icon: "check_circle", surface: "bg-status-done/12", text: "text-status-done-text", bar: "bg-status-done" },
  in_progress: { icon: "hourglass_top", surface: "bg-status-active/12", text: "text-status-active-text", bar: "bg-status-active" },
  not_started: { icon: "warning", surface: "bg-status-warning/15", text: "text-on-secondary-fixed", bar: "bg-status-warning" },
};

const TYPE_LABELS: Record<ProgressFinding["type"], string> = { footing: "Footing", wall: "Wall", column: "Column", slab: "Slab", roof: "Roof" };
const STATUSES: ReportedStatus[] = ["done", "in_progress", "not_started"];

type FindingCardProps = { finding: ProgressFinding; impact: { progress: number; value: number }; share: number; editing: boolean; onStatus: (status: ReportedStatus) => void };

export function FindingCard({ finding, impact, share, editing, onStatus }: FindingCardProps) {
  const look = LOOK[finding.status];
  const selectId = useId();
  const title = `${TYPE_LABELS[finding.type]} ${finding.elementId}`;
  return (
    <li data-testid={`finding-${finding.elementId}`} data-status={finding.status} className={cn("flex flex-col gap-space-xs rounded-lg p-space-sm", look.surface)}>
      <div className="flex items-start justify-between gap-space-sm">
        <p className={cn("flex items-center gap-1.5 text-body-md font-semibold", look.text)}>
          <Icon name={look.icon} size={18} />
          {title}: {ELEMENT_STATUS_STYLES[finding.status].label.toLowerCase()}
          {finding.status === "in_progress" ? ` (${Math.round(finding.percent)}%)` : ""}
        </p>
        <span className="shrink-0 font-mono text-label-numeric-sm text-on-surface-variant">AI {Math.round(finding.confidence * 100)}%</span>
      </div>
      <p className="text-body-sm text-pretty text-on-surface-variant">{finding.evidence}</p>
      <div className="flex items-center gap-space-xs">
        <span className="w-28 shrink-0 text-body-sm text-on-surface-variant">Schedule impact</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
          <span className={cn("block h-full rounded-full", look.bar)} style={{ width: `${Math.max(share, 0.02) * 100}%` }} />
        </span>
        <span className="w-14 text-end font-mono text-label-numeric-sm tabular-nums">+{formatPercent(impact.progress)}</span>
        <span className="w-20 text-end font-mono text-label-numeric-sm tabular-nums">{formatSoles(impact.value)}</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-space-xs">
          <label htmlFor={selectId} className="text-body-sm">
            Status of {finding.elementId}
          </label>
          <select id={selectId} value={finding.status} onChange={(event) => onStatus(event.target.value as ReportedStatus)} className="min-h-9 rounded-md border border-outline-variant bg-surface-container-lowest px-space-xs text-body-md">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {ELEMENT_STATUS_STYLES[status].label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </li>
  );
}
