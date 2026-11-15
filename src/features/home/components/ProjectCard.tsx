import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { MetricList } from "@/components/ui/MetricList";
import { formatArea, formatCount, formatSoles } from "@/lib/format";
import type { ProjectSummary } from "@/lib/schedule";
import type { Project } from "@/schemas/project";

const updatedFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

type ProjectCardProps = {
  project: Project;
  summary: ProjectSummary;
};

function ProjectActions({ id }: { id: string }) {
  return (
    <div className="mt-auto grid grid-cols-2 gap-space-xs">
      <Link href={`/proyecto/${id}`} className={buttonClasses("primary")}>
        <Icon name="view_in_ar" />
        Open workspace
      </Link>
      <Link href={`/proyecto/${id}/editor`} className={buttonClasses("ghost")}>
        <Icon name="architecture" />
        Edit plan
      </Link>
    </div>
  );
}

export function ProjectCard({ project, summary }: ProjectCardProps) {
  const titleId = `project-${project.id}-title`;
  return (
    <Card role="group" aria-labelledby={titleId} data-testid="project-card" data-project-id={project.id} className="flex w-full flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          {project.status === "draft" ? (
            <span className="self-start">
              <Badge status="not_started" label="Draft · review the plan" />
            </span>
          ) : null}
          <h3 id={titleId} className="font-display text-headline-sm [overflow-wrap:anywhere]">
            {project.name}
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            {project.location ? `${project.location} · ` : ""}Updated {updatedFormat.format(new Date(project.updatedAt))}
          </p>
        </div>
        <MetricList
          className="sm:grid-cols-3"
          metrics={[
            { label: "Built area", value: formatArea(summary.builtArea) },
            { label: "Floors", value: formatCount(summary.levels, "floor", "floors") },
            { label: "Shell budget", value: formatSoles(summary.cost.total) },
          ]}
        />
        <ProjectActions id={project.id} />
    </Card>
  );
}
