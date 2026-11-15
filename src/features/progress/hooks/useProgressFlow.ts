"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { downscaleImage } from "@/lib/image";
import { saveProgressPhoto } from "@/lib/projects";
import type { ProgressEntry, ProgressFinding } from "@/schemas/progress";
import { analyzePhoto, GENERIC_ERROR, ProgressRequestError } from "../api";
import { useProgressStore } from "../store";
import type { SitePhoto } from "../types";
import type { ProgressScope } from "./useProgressScope";

// Site photos are stored at most 1600 px on the long side, enough to read bricks and formwork
const PHOTO_MAX_SIDE = 1600;

type FlowInput = { projectId: string; week: number; scope: ProgressScope; save: (entry: ProgressEntry) => Promise<void> };

const store = () => useProgressStore.getState();

// Photo → AI → a log waiting for approval; confirming approves it and opens the 4D workspace
export function useProgressFlow({ projectId, week, scope, save }: FlowInput) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { choice, roomName, expected } = scope;
  const entryFor = (id: string, findings: ProgressFinding[], approved: boolean): ProgressEntry => ({ id, projectId, week, levelLabel: choice.label, sector: roomName, recordedAt: new Date().toISOString(), approved, hasPhoto: true, findings });

  const analyze = async (photo: SitePhoto) => {
    if (expected.length === 0) return store().setAnalysis({ status: "error", message: `Nothing is planned on the ${choice.label.toLowerCase()} up to week ${week + 1}. Choose another level.` });
    store().setAnalysis({ status: "loading" });
    try {
      const analysis = await analyzePhoto(photo.blob, photo.name, { week, levelLabel: choice.label, sector: roomName, expected });
      const id = crypto.randomUUID();
      await saveProgressPhoto(id, photo.blob).catch(() => undefined);
      await save(entryFor(id, analysis.findings, false));
      store().setResult(id, analysis.findings);
    } catch (error) {
      store().setAnalysis({ status: "error", message: error instanceof ProgressRequestError ? error.message : GENERIC_ERROR });
    }
  };

  const takePhoto = async (file: File | undefined) => {
    if (!file) return;
    const blob = await downscaleImage(file, PHOTO_MAX_SIDE, "image/jpeg", 0.85).catch(() => file);
    const photo: SitePhoto = { blob, url: URL.createObjectURL(blob), name: file.name, size: blob.size, takenAt: new Date().toISOString() };
    store().setPhoto(photo);
    await analyze(photo);
  };

  const confirm = async () => {
    const { entryId, findings, reset } = store();
    if (!entryId) return;
    setSaving(true);
    await save(entryFor(entryId, findings, true));
    reset();
    setSaving(false);
    router.push(`/proyecto/${projectId}`);
  };

  const retry = () => {
    const { photo } = store();
    if (photo) void analyze(photo);
  };

  return { saving, takePhoto, confirm, retry };
}
