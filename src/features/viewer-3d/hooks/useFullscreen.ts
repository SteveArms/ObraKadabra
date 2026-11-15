"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [target]);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) return void document.exitFullscreen();
    void target.current?.requestFullscreen?.().catch(() => undefined);
  }, [target]);

  return { isFullscreen, toggle };
}
