import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MetricList } from "@/components/ui/MetricList";
import { formatArea, formatCount, formatSoles } from "@/lib/format";
import type { DemoProject } from "@/lib/projects";
import { summarizeProject } from "@/lib/schedule";

export function DemoCard({ demo }: { demo: DemoProject }) {
  const summary = summarizeProject(demo.floorPlan);
  const titleId = `demo-${demo.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      data-testid="demo-card"
      data-demo-id={demo.id}
      data-total={Math.round(summary.cost.total)}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface-container-lowest"
    >
      <DemoPreview levels={summary.levels} />
      <div className="flex flex-1 flex-col gap-space-md p-space-lg">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-label-numeric-sm tracking-[0.05em] text-secondary uppercase">{demo.category}</p>
          <h3 id={titleId} className="font-display text-headline-md">
            {demo.name}
          </h3>
          <p className="text-body-md text-on-surface-variant">{demo.location}</p>
        </div>
        <MetricList
          metrics={[
            { label: "Built area", value: formatArea(summary.builtArea), testId: "demo-area" },
            { label: "Floors", value: formatCount(summary.levels, "floor", "floors"), testId: "demo-levels" },
            { label: "Shell budget", value: formatSoles(summary.cost.total), testId: "demo-budget" },
            { label: "Duration", value: formatCount(summary.durationWeeks, "week", "weeks"), testId: "demo-weeks" },
          ]}
        />
        <DemoHighlights highlights={demo.highlights} />
        <div className="mt-auto flex justify-end">
          <Link href={`/proyecto/${demo.id}`} data-testid="demo-open" className={buttonClasses("primary")}>
            <Icon name="view_in_ar" />
            Open 3D demo
          </Link>
        </div>
      </div>
    </article>
  );
}

// TODO: swap for the renders in /public/demos/ once they exist
function DemoPreview({ levels }: { levels: number }) {
  return (
    <div className="flex h-40 items-center justify-center bg-surface-container bg-[radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] bg-size-[24px_24px]">
      <Icon name={levels > 1 ? "home_work" : "house"} size={64} className="text-primary-container" />
    </div>
  );
}

function DemoHighlights({ highlights }: { highlights: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5 text-body-sm">
      {highlights.map((highlight) => (
        <li key={highlight} className="rounded-md bg-surface-container px-space-xs py-1">
          {highlight}
        </li>
      ))}
    </ul>
  );
}
