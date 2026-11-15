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

const focusLater = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

// The first invalid detail field, so focus lands on the problem the user must fix first
function firstInvalidField(errors: DetailsErrors): string | undefined {
  const first = (Object.keys(FIELD_IDS) as (keyof DetailsErrors)[]).find((key) => errors[key]);
  return first ? FIELD_IDS[first] : undefined;
}

// Validates on Continue (never by disabling it), then moves focus to the new step heading or the first problem
export function useWizardNavigation() {
  const router = useRouter();
  const { step, sheets, details, setStep, setActive } = useUploadStore(useShallow(({ step, sheets, details, setStep, setActive }) => ({ step, sheets, details, setStep, setActive })));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DetailsErrors>({});

  function go(next: WizardStep) {
    setError(null);
    setStep(next);
    focusLater(WIZARD_TITLE_ID);
  }

  function fail(message: string) {
    setError(message);
    focusLater(WIZARD_ERROR_ID);
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
    const field = firstInvalidField(errors);
    if (field) return document.getElementById(field)?.focus();
    router.push("/subir/procesando");
  }

  const back = () => (step > 0 ? go((step - 1) as WizardStep) : undefined);

  return { step, error, fieldErrors, next, back };
}
