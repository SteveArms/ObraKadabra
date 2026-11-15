import { Icon } from "@/components/ui/Icon";

const TIPS = [
  { title: "Shoot straight down", tag: "Not tilted", text: "Hold the phone parallel to the sheet on a flat table. Tilted photos distort the dimensions." },
  { title: "Even daylight", tag: "No shadows", text: "Keep your shadow and the phone's off the numbers and room names." },
  { title: "All four corners and one dimension", tag: "At least 1 dimension", text: "Make sure the full front or depth of the lot shows, for example 8.00 m." },
];

export function PhotoTips() {
  return (
    <section aria-labelledby="photo-tips-title" className="flex flex-col gap-space-md rounded-lg border border-line bg-surface-container-lowest p-space-lg">
      <div className="flex flex-col gap-1">
        <h2 id="photo-tips-title" className="flex items-center gap-space-xs font-display text-headline-sm">
          <Icon name="tips_and_updates" className="text-secondary" />
          Tips for a good plan photo
        </h2>
        <p className="text-body-md text-pretty text-on-surface-variant">A clear photo means fewer walls to fix later.</p>
      </div>
      <ol className="flex flex-col gap-space-xs">
        {TIPS.map((tip, index) => (
          <li key={tip.title} className="flex gap-space-sm rounded-md bg-surface-container-low p-space-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-status-done/12 text-status-done-text">
              <Icon name="check" size={18} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="flex flex-wrap items-baseline justify-between gap-x-space-sm text-body-md font-semibold">
                {index + 1}. {tip.title}
                <span className="font-mono text-label-numeric-sm font-medium text-secondary">{tip.tag}</span>
              </p>
              <p className="text-body-md text-pretty text-on-surface-variant">{tip.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
