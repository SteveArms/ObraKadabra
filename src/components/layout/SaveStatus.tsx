import { Icon } from "@/components/ui/Icon";

// TODO: read the real connection and save state once projects persist (phase 7)
export function SaveStatus() {
  return (
    <span
      data-testid="save-status"
      className="hidden items-center gap-1.5 rounded-full bg-surface-container px-space-xs py-1 font-mono text-label-numeric-sm text-on-surface-variant xl:inline-flex"
    >
      <Icon name="cloud_done" size={16} className="text-status-done" />
      Online · Saved
    </span>
  );
}
