import Link from "next/link";
import type { ReactNode } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import type { FailureKind } from "@/lib/http";

const ICONS: Record<FailureKind, string> = { offline: "wifi_off", service: "cloud_off", request: "error", timeout: "hourglass_disabled" };

type FailureNoticeProps = { message: string; kind?: FailureKind; onRetry: () => void; children?: ReactNode; testId?: string };

// When the AI is down or too slow, the demo shows the whole app working so the visit is not wasted
export function FailureNotice({ message, kind = "service", onRetry, children, testId }: FailureNoticeProps) {
  const aiDown = kind === "service" || kind === "timeout";
  return (
    <div role="alert" data-testid={testId} data-kind={kind} className="flex flex-col gap-space-md rounded-md bg-error-container p-space-md text-on-error-container">
      <p className="flex items-start gap-space-xs text-body-md text-pretty">
        <Icon name={ICONS[kind]} className="mt-0.5 shrink-0" />
        {message}
      </p>
      <div className="flex flex-wrap gap-space-sm">
        <Button onClick={onRetry}>
          <Icon name="refresh" />
          Try again
        </Button>
        {aiDown ? (
          <Link href={`/proyecto/${DEFAULT_PROJECT_ID}`} data-testid="failure-demo" className={buttonClasses("ai")}>
            <Icon name="auto_awesome" />
            Explore the demo instead
          </Link>
        ) : null}
        {children}
      </div>
    </div>
  );
}
