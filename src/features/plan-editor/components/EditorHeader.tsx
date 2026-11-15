import { Icon } from "@/components/ui/Icon";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import type { Project } from "@/schemas/project";
import { EditorActions } from "./EditorActions";
import { LayerControls } from "./LayerControls";
import { ReviewBar } from "./ReviewBar";
import { ScaleBadge } from "./ScaleBadge";

type EditorHeaderProps = { project: Project; plan: FloorPlan; pending: PendingElement[]; readOnly: boolean };

export function EditorHeader({ project, plan, pending, readOnly }: EditorHeaderProps) {
  return (
    <div className="flex flex-col gap-space-sm bg-surface-container-low px-gutter py-space-sm shadow-float lg:px-gutter-desktop">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <h1 className="flex min-w-0 items-center gap-space-xs font-display text-headline-sm [overflow-wrap:anywhere]">
          <Icon name="architecture" className="text-primary" />
          {project.name}
        </h1>
        <EditorActions project={project} pendingCount={pending.length} />
      </div>
      <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm">
        <ReviewBar pending={pending} />
        <ScaleBadge plan={plan} readOnly={readOnly} />
        <LayerControls />
      </div>
    </div>
  );
}
