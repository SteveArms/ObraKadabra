"use client";

import { useEffect, useState } from "react";
import { getPlanImage } from "@/lib/projects";

export type PlanImage = { url: string; width: number; height: number };

type ImageState = { key: string; image?: PlanImage };

// The uploaded photo of each floor lives in IndexedDB; demos and seeded projects simply have none
export function usePlanImage(projectId: string, level: number): { image?: PlanImage; loading: boolean } {
  const key = `${projectId}:${level}`;
  const [state, setState] = useState<ImageState | null>(null);

  useEffect(() => {
    let url: string | undefined;
    let active = true;
    getPlanImage(projectId, level)
      .catch(() => undefined)
      .then((record) => {
        if (!active) return;
        url = record ? URL.createObjectURL(record.blob) : undefined;
        setState({ key, image: record && url ? { url, width: record.width, height: record.height } : undefined });
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [projectId, level, key]);

  const current = state?.key === key ? state : null;
  return { image: current?.image, loading: current === null };
}
