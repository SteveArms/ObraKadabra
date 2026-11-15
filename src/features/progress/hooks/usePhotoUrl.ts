"use client";

import { useEffect, useState } from "react";
import { getProgressPhoto } from "@/lib/projects";

// Object URL of a saved site photo, revoked when the card unmounts
export function usePhotoUrl(entryId: string, hasPhoto: boolean): string | undefined {
  const [state, setState] = useState<{ id: string; url?: string } | null>(null);

  useEffect(() => {
    if (!hasPhoto) return;
    let url: string | undefined;
    let active = true;
    getProgressPhoto(entryId)
      .catch(() => undefined)
      .then((blob) => {
        if (!active) return;
        url = blob ? URL.createObjectURL(blob) : undefined;
        setState({ id: entryId, url });
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [entryId, hasPhoto]);

  return state?.id === entryId ? state.url : undefined;
}
