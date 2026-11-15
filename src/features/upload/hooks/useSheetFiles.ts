"use client";

import { useState } from "react";
import { planFileError } from "@/lib/plan";
import { fileToRaster } from "../image";
import { NO_EDITS, useUploadStore } from "../store";
import type { Sheet } from "../types";

export const MAX_SHEETS = 3;

async function sheetFrom(file: File): Promise<Sheet> {
  const raster = await fileToRaster(file);
  return { id: crypto.randomUUID(), fileName: file.name, source: raster, image: raster, edits: NO_EDITS, calibration: { points: [], meters: "" } };
}

// Adds a plan for the next floor, or replaces the one with replaceId, after checking type and size
export function useSheetFiles() {
  const addSheet = useUploadStore((state) => state.addSheet);
  const replaceSheet = useUploadStore((state) => state.replaceSheet);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(file: File | undefined, replaceId?: string) {
    if (!file) return;
    const problem = planFileError(file);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      const sheet = await sheetFrom(file);
      if (replaceId) replaceSheet(replaceId, sheet);
      else addSheet(sheet);
    } catch {
      setError("Unable to open this file. Try a JPG or PNG photo of the plan.");
    } finally {
      setBusy(false);
    }
  }

  return { load, busy, error };
}
