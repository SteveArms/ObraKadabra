"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProjectRepository, savePlanImages } from "@/lib/projects";
import { assemblePlan } from "@/lib/plan";
import { summarizeTakeoff } from "@/lib/takeoff";
import type { LevelPlan } from "@/schemas/plan-extraction";
import { GENERIC_ERROR, ProcessingError, readFloor } from "../api";
import { applyStep, EMPTY_PROGRESS, type Progress } from "../progress";
import { useUploadStore } from "../store";
import type { Sheet, WizardDetails } from "../types";
import { parseMeters } from "@/lib/format";
import { createDraftProject, sheetScale } from "../utils";

// Lets the last check mark register before the editor replaces this screen
const FINISH_PAUSE_MS = 700;

export type ProcessingPhase = "running" | "failed" | "done" | "empty";

async function readAllFloors(sheets: Sheet[], signal: AbortSignal, onProgress: (update: (progress: Progress) => Progress) => void): Promise<LevelPlan[]> {
  const plans: LevelPlan[] = [];
  for (const [index, sheet] of sheets.entries()) {
    const isLast = index === sheets.length - 1;
    const plan = await readFloor(sheet, sheetScale(sheet) ?? 1, index + 1, (event) => onProgress((progress) => applyStep(progress, event.step, event.counts, isLast, event.names)), signal);
    plans.push(plan);
  }
  return plans;
}

async function saveDraft(plans: LevelPlan[], details: WizardDetails, sheets: Sheet[]) {
  const calibratedMeters = sheets[0] ? (parseMeters(sheets[0].calibration.meters) ?? undefined) : undefined;
  const floorPlan = assemblePlan(plans, { name: details.name.trim(), levels: details.levels, floorHeight: parseMeters(details.floorHeight) ?? 2.6, roofType: details.roofType, calibratedMeters });
  const project = createDraftProject(crypto.randomUUID(), new Date(), floorPlan);
  await getProjectRepository().save(project);
  // The editor can still work without the background photo, so a storage failure here is not fatal
  await savePlanImages(sheets.map((sheet, index) => ({ projectId: project.id, level: index + 1, blob: sheet.image.blob, width: sheet.image.width, height: sheet.image.height }))).catch(() => undefined);
  const summary = summarizeTakeoff(floorPlan);
  return { project, counts: { builtArea: summary.builtArea, cost: summary.cost.total } };
}

export function usePlanProcessing() {
  const router = useRouter();
  const sheets = useUploadStore((state) => state.sheets);
  const details = useUploadStore((state) => state.details);
  const reset = useUploadStore((state) => state.reset);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [phase, setPhase] = useState<ProcessingPhase>(sheets.length > 0 ? "running" : "empty");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sheets.length === 0) return;
    const controller = new AbortController();
    const run = async () => {
      const plans = await readAllFloors(sheets, controller.signal, (update) => setProgress(update));
      const { project, counts } = await saveDraft(plans, details, sheets);
      setProgress((current) => applyStep(current, "volumetry", counts, true));
      setPhase("done");
      await new Promise((resolve) => setTimeout(resolve, FINISH_PAUSE_MS));
      if (controller.signal.aborted) return;
      router.replace(`/proyecto/${project.id}/editor`);
      reset();
    };
    run().catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof ProcessingError ? reason.message : GENERIC_ERROR);
      setPhase("failed");
    });
    return () => controller.abort();
  }, [attempt, sheets, details, router, reset]);

  const retry = () => {
    setProgress(EMPTY_PROGRESS);
    setError(null);
    setPhase("running");
    setAttempt((value) => value + 1);
  };

  return { phase, progress, error, retry };
}
