"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUploadStore } from "../store";
import type { WizardStep } from "../types";
import { calibrationError, detailsErrors, uploadError, type DetailsErrors } from "../utils";

export const WIZARD_TITLE_ID = "wizard-title";
export const WIZARD_ERROR_ID = "wizard-error";

const FIELD_IDS: Record<keyof DetailsErrors, string> = { name: "project-name", levels: "levels-error", floorHeight: "floor-height" };

// Validates on Continue (never by disabling it), then moves focus to the new step heading or the first problem
export function useWizardNavigation() {
  const router = useRouter();
  const { step, sheets, details, setStep, setActive } = useUploadStore(
    useShallow((state) => ({ step: state.step, sheets: state.sheets, details: state.details, setStep: state.setStep, setActive: state.setActive })),
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DetailsErrors>({});

  function go(next: WizardStep) {
    setError(null);
    setStep(next);
    requestAnimationFrame(() => document.getElementById(WIZARD_TITLE_ID)?.focus());
  }

  function fail(message: string) {
    setError(message);
    requestAnimationFrame(() => document.getElementById(WIZARD_ERROR_ID)?.focus());
  }

  function next() {
    if (step === 0) {
      const problem = uploadError(sheets);
      return problem ? fail(problem) : go(1);
    }
    if (step === 1) {
      const problem = calibrationError(sheets);
      if (!problem) return go(2);
      setActive(problem.sheetId);
      return fail(problem.message);
    }
    const errors = detailsErrors(details, sheets.length);
    setFieldErrors(errors);
    const first = (Object.keys(FIELD_IDS) as (keyof DetailsErrors)[]).find((key) => errors[key]);
    if (first) return document.getElementById(FIELD_IDS[first])?.focus();
    router.push("/subir/procesando");
  }

  const back = () => (step > 0 ? go((step - 1) as WizardStep) : undefined);

  return { step, error, fieldErrors, next, back };
}
