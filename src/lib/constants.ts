import type { StageStatus } from "@/schemas/stage-status";

// TODO: replace with the selected project once ProjectRepository exists (phase 1)
export const DEFAULT_PROJECT_ID = "demo-1";

// Text tones are darker steps of each status hue so they reach 4.5:1 on their 12% tint
export const STAGE_STATUS_STYLES: Record<StageStatus, { label: string; dotClass: string; tintClass: string; textClass: string }> = {
  not_started: { label: "Not started", dotClass: "bg-status-idle", tintClass: "bg-status-idle/12", textClass: "text-status-idle-text" },
  in_progress: { label: "In progress", dotClass: "bg-status-active", tintClass: "bg-status-active/12", textClass: "text-status-active-text" },
  done: { label: "Done", dotClass: "bg-status-done", tintClass: "bg-status-done/12", textClass: "text-status-done-text" },
  delayed: { label: "Delayed", dotClass: "bg-status-delayed", tintClass: "bg-status-delayed/12", textClass: "text-status-delayed-text" },
};
