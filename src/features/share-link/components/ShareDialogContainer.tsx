"use client";

import { useEffect } from "react";
import { useShareLink } from "../hooks/useShareLink";
import { ShareDialog } from "./ShareDialog";

// Loaded on the first click, with the project storage it needs, so no page pays for sharing while it loads
export default function ShareDialogContainer({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const link = useShareLink(projectId);
  const { prepare } = link;

  useEffect(() => void prepare(), [prepare]);

  return <ShareDialog open onClose={onClose} projectId={projectId} {...link} />;
}
