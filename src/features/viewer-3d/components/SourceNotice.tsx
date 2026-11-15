"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useViewerStore, type GlbIssue } from "../store";
import { GLASS } from "./ViewerToolbar";

const MESSAGES: Record<GlbIssue, string> = {
  load_failed: "The 3D file could not be loaded, so the model generated from the plan is shown.",
  unlabeled: "The 3D file has no elements named after the plan, so the generated model is shown.",
  misaligned: "The 3D file does not line up with the plan, so the generated model is shown.",
};

export function SourceNotice() {
  const glbIssue = useViewerStore((state) => state.glbIssue);
  return (
    <div role="status" className="self-start">
      {glbIssue ? (
        <p data-testid="viewer-source-notice" className={cn(GLASS, "flex max-w-md items-start gap-1.5 px-space-sm py-space-xs text-body-sm text-on-surface")}>
          <Icon name="info" size={16} className="mt-0.5 text-primary" />
          {MESSAGES[glbIssue]}
        </p>
      ) : null}
    </div>
  );
}
