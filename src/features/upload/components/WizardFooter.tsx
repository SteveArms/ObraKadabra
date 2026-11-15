import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { WizardStep } from "../types";

const NEXT_LABELS = ["Continue to calibration", "Continue to project details", "Read my plan with AI"];

type WizardFooterProps = { step: WizardStep; onNext: () => void; onBack: () => void };

export function WizardFooter({ step, onNext, onBack }: WizardFooterProps) {
  return (
    <div data-wizard-footer className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="flex min-h-18 items-center justify-between gap-space-sm px-gutter py-space-sm pb-[max(var(--spacing-space-sm),env(safe-area-inset-bottom))] lg:px-gutter-desktop">
        <div className="flex items-center gap-space-xs">
          {step > 0 ? (
            <Button variant="ghost" onClick={onBack} aria-label="Back to the previous step" className="px-space-xs">
              <Icon name="arrow_back" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          ) : null}
          <Link href="/" className="rounded-md px-space-xs py-space-xs text-body-md text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
            <span className="sm:hidden">Cancel</span>
            <span className="hidden sm:inline">Cancel and return to projects</span>
          </Link>
        </div>
        <div className="flex items-center gap-space-md">
          <p className="hidden font-mono text-label-numeric-sm text-on-surface-variant md:block">Step {step + 1} of 3</p>
          <Button variant="milestone" onClick={onNext} data-testid="wizard-next" className="min-h-12 px-space-md text-body-lg font-semibold">
            {NEXT_LABELS[step]}
            <Icon name={step === 2 ? "auto_awesome" : "arrow_forward"} />
          </Button>
        </div>
      </div>
    </div>
  );
}
