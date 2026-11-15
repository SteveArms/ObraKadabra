"use client";

import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { useViewerStore } from "../store";
import { MaterialLegend } from "./MaterialLegend";
import { StatusLegend } from "./StatusLegend";

// Always open on wider screens; on phones it folds into one chip so the house keeps the space
export function ViewerLegend() {
  const colorMode = useViewerStore((state) => state.colorMode);
  const legend = colorMode === "status" ? <StatusLegend /> : <MaterialLegend />;
  return (
    <>
      <div className="flex max-sm:hidden">{legend}</div>
      <details className="group self-start sm:hidden">
        <summary data-testid="legend-toggle" className={cn(GLASS_SURFACE, "flex min-h-10 cursor-pointer list-none items-center gap-1 px-space-sm text-body-sm [&::-webkit-details-marker]:hidden")}>
          <Icon name="legend_toggle" size={18} />
          Legend
          <Icon name="expand_more" size={18} className="transition-[rotate] duration-150 group-open:rotate-180" />
        </summary>
        <div className="mt-1 flex">{legend}</div>
      </details>
    </>
  );
}
