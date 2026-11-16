import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DownloadReportButton } from "@/features/budget";
import { formatArea, formatCount } from "@/lib/format";
import { plannedProgressAt } from "@/lib/schedule";
import { builtArea } from "@/lib/takeoff";
import type { ActualProgress, ElementStatus, Schedule } from "@/schemas/schedule";
import type { Project } from "@/schemas/project";

function overallStatus(schedule: Schedule, week: number): ElementStatus {
  const progress = plannedProgressAt(schedule, week);
  if (progress >= 1) return "done";
  return progress > 0 ? "in_progress" : "not_started";
}

export function ProjectBar({ project, schedule, week, progress }: { project: Project; schedule: Schedule; week: number; progress?: ActualProgress }) {
  const plan = project.floorPlan;
  return (
    <div className="flex items-start justify-between gap-space-sm px-gutter py-space-sm md:items-center lg:px-gutter-desktop lg:py-space-md">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-display text-headline-md [overflow-wrap:anywhere]">{project.name}</h1>
        <div className="flex flex-wrap items-center gap-space-xs text-body-md text-on-surface-variant">
          <span className="font-mono tabular-nums">{formatArea(builtArea(plan))}</span>
          <span aria-hidden="true">·</span>
          <span>{formatCount(plan.meta.levels, "floor", "floors")}</span>
          <Badge status={overallStatus(schedule, week)} />
        </div>
      </div>
      <div className="flex shrink-0 gap-space-xs">
        <DownloadReportButton project={project} schedule={schedule} week={week} progress={progress} />
        <Link href={`/proyecto/${project.id}/editor`} className={buttonClasses("ghost", "shrink-0 max-sm:px-2")}>
          <Icon name="architecture" />
          <span className="max-sm:sr-only">Edit plan</span>
        </Link>
      </div>
    </div>
  );
}
