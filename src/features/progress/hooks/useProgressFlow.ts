"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { downscaleImage } from "@/lib/image";
import { saveProgressPhoto } from "@/lib/projects";
import type { ProgressEntry, ProgressFinding } from "@/schemas/progress";
import { asRequestFailure } from "@/lib/http";
import { analyzePhoto, GENERIC_ERROR } from "../api";
import { useProgressStore } from "../store";
import type { SitePhoto } from "../types";
import type { ProgressScope } from "./useProgressScope";

// Site photos are stored at most 1600 px on the long side, enough to read bricks and formwork
const PHOTO_MAX_SIDE = 1600;

type FlowInput = { projectId: string; week: number; scope: ProgressScope; save: (entry: ProgressEntry) => Promise<void> };

const store = () => useProgressStore.getState();

async function toSitePhoto(file: File): Promise<SitePhoto> {
  const blob = await downscaleImage(file, PHOTO_MAX_SIDE, "image/jpeg", 0.85).catch(() => file);
  return { blob, url: URL.createObjectURL(blob), name: file.name, size: blob.size, takenAt: new Date().toISOString() };
}


function makeEntry({ projectId, week, scope }: FlowInput, id: string, findings: ProgressFinding[], approved: boolean): ProgressEntry {
  return { id, projectId, week, levelLabel: scope.choice.label, sector: scope.roomName, recordedAt: new Date().toISOString(), approved, hasPhoto: true, findings };
}

async function analyzeAndLog(input: FlowInput, photo: SitePhoto) {
  const { week, scope, save } = input;
  if (scope.expected.length === 0) return store().setAnalysis({ status: "error", message: `Nothing is planned on the ${scope.choice.label.toLowerCase()} up to week ${week + 1}. Choose another level.` });
  store().setAnalysis({ status: "loading" });
  try {
    const analysis = await analyzePhoto(photo.blob, photo.name, { week, levelLabel: scope.choice.label, sector: scope.roomName, expected: scope.expected });
    const id = crypto.randomUUID();
    // The photo is only for the history thumbnail, so storing it never holds back the findings
    void saveProgressPhoto(id, photo.blob).catch(() => undefined);
    await save(makeEntry(input, id, analysis.findings, false));
    store().setResult(id, analysis.findings);
  } catch (error) {
    const { message, kind } = asRequestFailure(error, GENERIC_ERROR);
    store().setAnalysis({ status: "error", message, kind });
  }
}

// Photo → AI → a log waiting for approval; confirming approves it and opens the 4D workspace
export function useProgressFlow(input: FlowInput) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const takePhoto = async (file: File | undefined) => {
    if (!file) return;
    const photo = await toSitePhoto(file);
    store().setPhoto(photo);
    await analyzeAndLog(input, photo);
  };

  const confirm = async () => {
    const { entryId, findings, reset } = store();
    if (!entryId) return;
    setSaving(true);
    try {
      await input.save(makeEntry(input, entryId, findings, true));
      reset();
      router.push(`/proyecto/${input.projectId}`);
    } finally {
      setSaving(false);
    }
  };

  const retry = () => {
    const { photo } = store();
    if (photo) void analyzeAndLog(input, photo);
  };

  return { saving, takePhoto, confirm, retry };
}
