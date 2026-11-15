import { Icon } from "@/components/ui/Icon";

type NextStepHintProps = { step?: number; title: string; text: string; icon: string };

export function NextStepHint({ step, title, text, icon }: NextStepHintProps) {
  return (
    <aside className="flex flex-col gap-space-sm rounded-lg border border-line bg-surface-container-lowest p-space-lg">
      <p className="flex items-center gap-space-sm font-display text-headline-sm">
        <span className="flex size-7 items-center justify-center rounded-full bg-surface-container-high font-mono text-label-numeric-sm">
          {step ?? <Icon name="arrow_forward" size={16} />}
        </span>
        {title}
      </p>
      <p className="flex gap-space-xs rounded-md bg-primary-fixed/50 p-space-sm text-body-md text-pretty text-on-primary-fixed-variant">
        <Icon name={icon} className="mt-0.5" />
        {text}
      </p>
    </aside>
  );
}
