"use client";

import { useState } from "react";
import { renderEdits } from "../image";
import { NO_EDITS, useUploadStore } from "../store";
import type { Edits, Rect, Rotation, Sheet } from "../types";
import { rotateRect } from "../utils";

export function useSheetEdits(sheet: Sheet) {
  const setImage = useUploadStore((state) => state.setImage);
  const [busy, setBusy] = useState(false);

  async function apply(edits: Edits) {
    setBusy(true);
    try {
      const image = edits === NO_EDITS ? sheet.source : await renderEdits(sheet.source, edits);
      setImage(sheet.id, edits, image);
    } finally {
      setBusy(false);
    }
  }

  // The crop is stored in rotated pixels, so it turns with the image
  const rotate = () => {
    const rotation = ((sheet.edits.rotation + 90) % 360) as Rotation;
    const turnedHeight = sheet.edits.rotation % 180 === 0 ? sheet.source.height : sheet.source.width;
    const crop = sheet.edits.crop && rotateRect(sheet.edits.crop, turnedHeight);
    return apply({ ...sheet.edits, rotation, crop });
  };
  const toggleContrast = () => apply({ ...sheet.edits, contrast: !sheet.edits.contrast });
  // The picked rectangle is in the pixels of the current (already cropped) image
  const crop = (rect: Rect) => {
    const offset = sheet.edits.crop ?? { x: 0, y: 0 };
    return apply({ ...sheet.edits, crop: { ...rect, x: rect.x + offset.x, y: rect.y + offset.y } });
  };
  const reset = () => apply(NO_EDITS);

  return { busy, rotate, toggleContrast, crop, reset, edited: sheet.edits !== NO_EDITS };
}
