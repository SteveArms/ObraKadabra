"use client";

import { Icon } from "@/components/ui/Icon";
import { Stepper } from "@/components/ui/Stepper";
import { useWizardNavigation, WIZARD_ERROR_ID, WIZARD_TITLE_ID } from "../hooks/useWizardNavigation";
import { CalibrateStep } from "./CalibrateStep";
import { DetailsStep } from "./DetailsStep";
import { UploadStep } from "./UploadStep";
import { WizardFooter } from "./WizardFooter";

const STEPS = ["Upload plan", "Calibrate scale", "Project details"];
const TITLES = ["Digitize your floor plan", "Calibrate the scale", "Add the project details"];
const INTROS = [
  "Upload a straight-on photo or a PDF. The AI finds load-bearing walls, partitions, doors and windows, and you review everything before it counts.",
  "Mark a length you know on the plan so the AI can turn pixels into meters for walls, areas and volumes.",
  "These parameters set heights, slabs and the roof in the 3D model and the budget.",
];

export function UploadWizard() {
  const nav = useWizardNavigation();
  return (
    <div data-testid="upload-wizard" data-step={nav.step} className="flex flex-col gap-space-lg px-gutter pt-space-lg pb-32 lg:px-gutter-desktop">
      <div className="flex flex-col gap-space-md lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-[70ch] flex-col gap-space-xs">
          <p className="flex items-center gap-1.5 self-start rounded-full bg-ai-tint px-space-sm py-1 font-mono text-label-numeric-sm tracking-[0.05em] text-ai-strong uppercase">
            <Icon name="auto_awesome" size={16} />
            AI plan reader
          </p>
          <h1 id={WIZARD_TITLE_ID} tabIndex={-1} className="font-display text-headline-lg-mobile text-balance outline-none md:text-headline-lg">
            {TITLES[nav.step]}
          </h1>
          <p className="text-body-lg text-pretty text-on-surface-variant">{INTROS[nav.step]}</p>
        </div>
        <Stepper steps={STEPS} currentIndex={nav.step} label="Upload steps" />
      </div>
      <p id={WIZARD_ERROR_ID} tabIndex={-1} role="alert" data-testid="wizard-error" className="flex items-center gap-space-xs rounded-md bg-error-container px-space-sm py-space-xs text-body-md text-on-error-container outline-none empty:hidden">
        {nav.error}
      </p>
      {nav.step === 0 ? <UploadStep /> : null}
      {nav.step === 1 ? <CalibrateStep /> : null}
      {nav.step === 2 ? <DetailsStep errors={nav.fieldErrors} /> : null}
      <WizardFooter step={nav.step} onNext={nav.next} onBack={nav.back} />
    </div>
  );
}
