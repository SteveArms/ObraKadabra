import { Icon } from "./Icon";

type SectionHeadingProps = {
  id: string;
  title: string;
  overline?: string;
  icon?: string;
  description?: string;
};

export function SectionHeading({ id, title, overline, icon, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-space-xs md:flex-row md:items-end md:justify-between md:gap-space-lg">
      <div className="flex flex-col gap-1">
        {overline ? (
          <p className="flex items-center gap-1.5 font-mono text-label-numeric-sm tracking-[0.05em] text-primary uppercase">
            {icon ? <Icon name={icon} size={16} /> : null}
            {overline}
          </p>
        ) : null}
        <h2 id={id} className="font-display text-headline-lg-mobile text-balance md:text-headline-lg">
          {title}
        </h2>
      </div>
      {description ? <p className="max-w-[48ch] text-body-md text-pretty text-on-surface-variant">{description}</p> : null}
    </div>
  );
}
