"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useShareLink } from "../hooks/useShareLink";
import { ShareDialog } from "./ShareDialog";

export function ShareButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const link = useShareLink(projectId);

  const openDialog = () => {
    setOpen(true);
    void link.prepare();
  };

  return (
    <>
      <button type="button" aria-haspopup="dialog" data-testid="header-share" onClick={openDialog} className={buttonClasses("ghost")}>
        <Icon name="share" />
        <span className="sr-only md:not-sr-only">Share</span>
      </button>
      <ShareDialog open={open} onClose={() => setOpen(false)} projectId={projectId} {...link} />
    </>
  );
}
