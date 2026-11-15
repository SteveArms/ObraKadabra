"use client";

import Image from "next/image";
import { formatCount, formatDate } from "@/lib/format";
import { usePhotoUrl } from "@/lib/hooks/usePhotoUrl";
import type { ProgressEntry } from "@/schemas/progress";
import { latestPhotoEntry } from "../utils";

function findingsSummary(entry: ProgressEntry): string {
  const done = entry.findings.filter((finding) => finding.status === "done").length;
  const working = entry.findings.filter((finding) => finding.status === "in_progress").length;
  return [done ? `${formatCount(done, "part", "parts")} finished` : "", working ? `${formatCount(working, "part", "parts")} under way` : ""].filter(Boolean).join(", ");
}

// The server signs the cloud photo; on this device the photo comes from the browser's own storage
export function LatestPhoto({ entries, photoUrl }: { entries: ProgressEntry[]; photoUrl?: string }) {
  const entry = latestPhotoEntry(entries);
  const localUrl = usePhotoUrl(entry?.id ?? "", Boolean(entry) && !photoUrl);
  const src = photoUrl ?? localUrl;
  return (
    <section aria-labelledby="latest-photo" className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
      <h2 id="latest-photo" className="font-display text-headline-sm">
        Latest photo from the site
      </h2>
      {entry && src ? (
        <figure data-testid="shared-photo" className="flex flex-col gap-space-xs">
          <Image src={src} alt={`Site photo of the ${entry.levelLabel.toLowerCase()}, week ${entry.week}`} width={1600} height={1067} unoptimized className="h-auto max-h-[28rem] w-full rounded-lg object-cover outline-1 -outline-offset-1 outline-black/10" />
          <figcaption className="text-body-sm text-on-surface-variant">
            <span className="font-mono tabular-nums">{formatDate(entry.recordedAt)}</span> · {entry.levelLabel}
            {findingsSummary(entry) ? ` · ${findingsSummary(entry)}` : ""}
          </figcaption>
        </figure>
      ) : (
        <p className="text-body-md text-on-surface-variant">Photos from the site show up here once the foreman approves them.</p>
      )}
    </section>
  );
}
