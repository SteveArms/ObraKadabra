"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Project } from "@/schemas/project";
import type { ActualProgress, Schedule } from "@/schemas/schedule";
import { downloadReportPdf } from "../pdf";
import { buildReport } from "../report";

type DownloadReportButtonProps = { project: Project; schedule: Schedule; week: number; progress?: ActualProgress };

// The summary and the week's materials as a PDF the owner can print or send to the hardware store
export function DownloadReportButton({ project, schedule, week, progress }: DownloadReportButtonProps) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      await downloadReportPdf(buildReport({ project, schedule, week, progress, generatedAt: new Date() }));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="ghost" onClick={download} disabled={busy} data-testid="download-report" className="shrink-0 max-sm:px-2">
      <Icon name={busy ? "progress_activity" : "picture_as_pdf"} className={busy ? "motion-safe:animate-spin" : undefined} />
      <span className="max-sm:sr-only">{busy ? "Preparing PDF…" : "Download PDF"}</span>
    </Button>
  );
}
