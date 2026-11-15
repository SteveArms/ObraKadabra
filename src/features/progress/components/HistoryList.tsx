"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import type { ProgressEntry } from "@/schemas/progress";
import { usePhotoUrl } from "../hooks/usePhotoUrl";

const date = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

function HistoryCard({ entry }: { entry: ProgressEntry }) {
  const url = usePhotoUrl(entry.id, entry.hasPhoto);
  const summary = entry.findings.map((finding) => `${finding.elementId} ${ELEMENT_STATUS_STYLES[finding.status].label.toLowerCase()}`).join(", ");
  return (
    <li data-testid="history-entry" data-approved={entry.approved} className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-float">
      <div className="relative h-36 bg-surface-container">
        {url ? <Image src={url} alt="" fill unoptimized className="object-cover" /> : null}
        <span className={cn("absolute end-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-body-sm font-semibold", entry.approved ? "bg-status-done-text text-on-primary" : "bg-secondary-container text-on-secondary-container")}>
          <Icon name={entry.approved ? "check" : "schedule"} size={14} />
          {entry.approved ? "Approved" : "Pending confirmation"}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-space-sm">
        <p className="flex justify-between gap-space-xs font-mono text-label-numeric-sm text-on-surface-variant">
          <span>{date.format(new Date(entry.recordedAt))}</span>
          <span className="text-primary">Week {entry.week}</span>
        </p>
        <h3 className="text-body-md font-semibold">{entry.sector ? `${entry.levelLabel} · ${entry.sector}` : entry.levelLabel}</h3>
        <p className="text-body-sm text-pretty text-on-surface-variant">{summary || "No elements reported."}</p>
      </div>
    </li>
  );
}

export function HistoryList({ entries }: { entries: ProgressEntry[] }) {
  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-space-sm px-gutter py-space-lg lg:px-gutter-desktop">
      <div>
        <p className="font-mono text-label-numeric-sm tracking-[0.05em] text-secondary uppercase">Quality trail</p>
        <h2 id="history-title" className="font-display text-headline-md">
          Photo log history
        </h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">No photo logs yet. Your first confirmed photo will show up here with its week.</p>
      ) : (
        <ul data-testid="history-list" className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}
