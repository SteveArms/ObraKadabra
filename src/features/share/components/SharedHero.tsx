import { Icon } from "@/components/ui/Icon";
import { formatArea, formatCount } from "@/lib/format";
import { builtArea } from "@/lib/takeoff";
import type { Project } from "@/schemas/project";

export function SharedHero({ project }: { project: Project }) {
  const plan = project.floorPlan;
  // Demo names already carry the area and floors, so the line below only adds what the name lacks
  const facts = [formatArea(builtArea(plan)), formatCount(plan.meta.levels, "floor", "floors")].filter((fact) => !project.name.includes(fact));
  const details = [project.location, ...facts].filter(Boolean).join(" · ");
  return (
    <header className="flex flex-col gap-space-xs">
      <span className="inline-flex items-center gap-1 self-start rounded-full bg-tertiary-fixed px-space-xs py-0.5 text-body-sm font-medium text-on-tertiary-fixed">
        <Icon name="family_restroom" size={16} />
        Family view
      </span>
      <h1 className="font-display text-display-lg-mobile text-balance md:text-display-lg">Our future home</h1>
      <p className="text-body-lg font-medium text-primary [overflow-wrap:anywhere]">{project.name}</p>
      {details ? <p className="text-body-md text-on-surface-variant">{details}</p> : null}
    </header>
  );
}
