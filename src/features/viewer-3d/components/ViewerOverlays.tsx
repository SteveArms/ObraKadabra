import type { FloorPlan } from "@/schemas/floor-plan";
import { CoordinatesBadge } from "./CoordinatesBadge";
import { ElementPopover } from "./ElementPopover";
import { SourceNotice } from "./SourceNotice";
import { StatusLegend } from "./StatusLegend";
import { ViewerToolbar } from "./ViewerToolbar";

type ViewerOverlaysProps = { plan: FloorPlan; cuts: number[]; isFullscreen: boolean; onToggleFullscreen: () => void };

// One column over the canvas: details sit under the legend on desktop and drop to a bottom sheet on mobile
export function ViewerOverlays({ plan, cuts, isFullscreen, onToggleFullscreen }: ViewerOverlaysProps) {
  return (
      <div className="pointer-events-none absolute inset-space-sm z-10 flex flex-col gap-space-xs">
        <ViewerToolbar cuts={cuts} isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />
        <StatusLegend />
        <SourceNotice />
        <div className="pointer-events-auto flex min-h-0 max-w-full self-start max-sm:mt-auto">
          <ElementPopover plan={plan} />
        </div>
        <div className="mt-auto max-sm:hidden">
          <CoordinatesBadge />
        </div>
      </div>
  );
}
