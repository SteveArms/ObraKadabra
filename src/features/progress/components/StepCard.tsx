import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export function StepCard({ step, title, icon, aside, children }: { step: number; title: string; icon: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${step}`} className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-float">
      <div className="flex items-center justify-between gap-space-sm">
        <h2 id={`step-${step}`} className="flex items-center gap-1.5 font-mono text-label-numeric-sm tracking-[0.05em] text-primary uppercase">
          <Icon name={icon} size={16} />
          Step {step}: {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
