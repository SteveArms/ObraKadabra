"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const ShareDialogContainer = dynamic(() => import("./ShareDialogContainer"), { ssr: false });

export function ShareButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" data-testid="header-share" onClick={() => setOpen(true)} className={buttonClasses("ghost")}>
        <Icon name="share" />
        <span className="sr-only md:not-sr-only">Share</span>
      </button>
      {open ? <ShareDialogContainer projectId={projectId} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
