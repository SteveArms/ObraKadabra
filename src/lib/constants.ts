import type { ElementStatus } from "@/schemas/schedule";

// TODO: point the header and nav to the project the user last opened instead of the first demo
export const DEFAULT_PROJECT_ID = "casa-1-piso-90";

// colorVar lets WebGL materials read the same CSS token as the UI; text tones are darker steps so they reach 4.5:1 on their 12% tint
export const ELEMENT_STATUS_STYLES: Record<ElementStatus, { label: string; dotClass: string; tintClass: string; textClass: string; colorVar: string }> = {
  not_started: { label: "Not started", dotClass: "bg-status-idle", tintClass: "bg-status-idle/12", textClass: "text-status-idle-text", colorVar: "--color-status-idle" },
  in_progress: { label: "In progress", dotClass: "bg-status-active", tintClass: "bg-status-active/12", textClass: "text-status-active-text", colorVar: "--color-status-active" },
  done: { label: "Done", dotClass: "bg-status-done", tintClass: "bg-status-done/12", textClass: "text-status-done-text", colorVar: "--color-status-done" },
  delayed: { label: "Delayed", dotClass: "bg-status-delayed", tintClass: "bg-status-delayed/12", textClass: "text-status-delayed-text", colorVar: "--color-status-delayed" },
};

// Detected elements below this AI confidence are flagged for review in the editor
export const PENDING_CONFIDENCE = 0.75;
