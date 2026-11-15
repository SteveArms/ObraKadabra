"use client";

import { Icon } from "@/components/ui/Icon";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { isCloudStorage } from "@/lib/projects";

// Says where projects are kept and whether the app can reach the cloud right now, nothing more
export function SaveStatus() {
  const online = useOnlineStatus();
  const cloud = isCloudStorage();
  const label = !online ? "Offline" : cloud ? "Cloud saving on" : "Saved on this device";
  const icon = !online ? "cloud_off" : cloud ? "cloud_done" : "devices";
  return (
    <span data-testid="save-status" data-online={online} className="hidden items-center gap-1.5 rounded-full bg-surface-container px-space-xs py-1 font-mono text-label-numeric-sm text-on-surface-variant xl:inline-flex">
      <Icon name={icon} size={16} className={online ? "text-status-done" : "text-status-delayed"} />
      {label}
    </span>
  );
}
