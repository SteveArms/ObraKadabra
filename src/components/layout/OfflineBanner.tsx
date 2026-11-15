"use client";

import { Icon } from "@/components/ui/Icon";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

// The 3D viewer and the demos keep working offline; only the AI and cloud saving need a connection
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <p role="status" data-testid="offline-banner" className="flex items-center justify-center gap-space-xs bg-inverse-surface px-gutter py-space-xs text-center text-body-sm text-inverse-on-surface">
      <Icon name="wifi_off" size={18} />
      You’re offline. You can keep exploring; reading plans and photos with AI needs a connection.
    </p>
  );
}
