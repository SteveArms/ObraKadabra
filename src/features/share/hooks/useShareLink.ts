"use client";

import { useCallback, useEffect, useState } from "react";
import { getProjectRepository } from "@/lib/projects";

export type ShareLinkState = { status: "idle" | "loading" | "error" } | { status: "ready"; url: string };

const COPIED_MS = 2000;

// Creates the share token on first use (or gets the existing one) and turns it into an absolute link
export function useShareLink(projectId: string) {
  const [state, setState] = useState<ShareLinkState>({ status: "idle" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const prepare = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const token = await getProjectRepository().share(projectId);
      setState({ status: "ready", url: new URL(`/compartir/${token}`, window.location.origin).toString() });
    } catch {
      setState({ status: "error" });
    }
  }, [projectId]);

  const copy = useCallback(async () => {
    if (state.status !== "ready") return;
    await navigator.clipboard
      .writeText(state.url)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  }, [state]);

  return { state, copied, prepare, copy };
}
