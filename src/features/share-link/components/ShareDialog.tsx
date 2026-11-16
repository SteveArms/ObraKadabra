"use client";

import { Button, buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { isCloudStorage, isDemoId } from "@/lib/projects";
import type { ShareLinkState } from "../hooks/useShareLink";
import { whatsappShareUrl } from "../utils";

type ShareDialogProps = { open: boolean; onClose: () => void; projectId: string; state: ShareLinkState; copied: boolean; prepare: () => void; copy: () => void };

export function ShareDialog({ open, onClose, projectId, state, copied, prepare, copy }: ShareDialogProps) {
  const deviceOnly = !isDemoId(projectId) && !isCloudStorage();
  return (
    <Dialog open={open} title="Share with your family" onClose={onClose} testId="share-dialog">
      <p className="text-body-md text-pretty text-on-surface-variant">Anyone with this link can follow the build from their phone. They see the progress but can’t change anything.</p>
      {state.status === "ready" ? <ShareLinkActions url={state.url} copied={copied} copy={copy} /> : null}
      {state.status === "loading" || state.status === "idle" ? <p className="text-body-md text-on-surface-variant">Creating the link…</p> : null}
      {state.status === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-space-xs text-body-md text-on-error-container">
          <p>We couldn’t create the link. Check your connection and try again.</p>
          <Button variant="ghost" onClick={prepare}>
            Try again
          </Button>
        </div>
      ) : null}
      {deviceOnly ? <p className="rounded-md bg-surface-container-low p-space-sm text-body-sm text-on-surface-variant">This project is saved in this browser only, so the link won’t open on other phones yet.</p> : null}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}

function ShareLinkActions({ url, copied, copy }: { url: string; copied: boolean; copy: () => void }) {
  return (
    <div className="flex flex-col gap-space-sm">
      <label className="flex flex-col gap-1 text-body-sm font-medium">
        Share link
        <input readOnly value={url} data-testid="share-link" onFocus={(event) => event.currentTarget.select()} className="min-h-11 rounded-md border border-line bg-surface-container-low px-space-sm font-mono text-label-numeric-md text-on-surface" />
      </label>
      <div className="grid gap-space-sm sm:grid-cols-2">
        <Button onClick={copy} className="min-h-11">
          <Icon name={copied ? "check" : "content_copy"} />
          <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        </Button>
        <a href={whatsappShareUrl(url)} target="_blank" rel="noopener noreferrer" className={buttonClasses("success", "min-h-11")}>
          <Icon name="chat" />
          Share on WhatsApp
        </a>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="self-start text-body-sm font-medium text-primary underline underline-offset-4">
        Preview the family view
      </a>
    </div>
  );
}
