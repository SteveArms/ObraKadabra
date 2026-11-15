"use client";

import { useEffect, useState } from "react";
import { looksBlurry } from "@/lib/image";

// Checked once per image; a failed check never blocks the upload, it only skips the warning
export function useBlurCheck(image: Blob): boolean {
  const [result, setResult] = useState<{ image: Blob; blurry: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    looksBlurry(image)
      .catch(() => false)
      .then((blurry) => active && setResult({ image, blurry }));
    return () => {
      active = false;
    };
  }, [image]);

  return result?.image === image && result.blurry;
}
