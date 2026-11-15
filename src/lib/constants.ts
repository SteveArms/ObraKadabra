import type { StageStatus } from "@/schemas/stage-status";

// TODO: replace with the selected project once ProjectRepository exists (phase 1)
export const DEFAULT_PROJECT_ID = "demo-1";

export const STAGE_STATUS_STYLES: Record<StageStatus, { label: string; dotClass: string; tintClass: string }> = {
  not_started: { label: "Not started", dotClass: "bg-status-idle", tintClass: "bg-status-idle/12" },
  in_progress: { label: "In progress", dotClass: "bg-status-active", tintClass: "bg-status-active/12" },
  done: { label: "Done", dotClass: "bg-status-done", tintClass: "bg-status-done/12" },
  delayed: { label: "Delayed", dotClass: "bg-status-delayed", tintClass: "bg-status-delayed/12" },
};
