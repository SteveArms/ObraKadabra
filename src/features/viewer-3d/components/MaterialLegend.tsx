import { cn } from "@/lib/cn";
import { BUILDING_MATERIAL_STYLES, BUILDING_MATERIALS } from "../scene";
import { GLASS } from "./ViewerToolbar";

// Material mode legend: what each color is made of, plus the two highlights that carry the schedule state
export function MaterialLegend() {
  return (
    <ul aria-label="Material legend" className={cn(GLASS, "flex flex-wrap gap-1 self-start p-1")}>
      {BUILDING_MATERIALS.map((material) => (
        <li key={material} className="flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-0.5 text-body-sm text-on-surface">
          <span aria-hidden="true" className={cn("size-2.5 rounded-sm", BUILDING_MATERIAL_STYLES[material].swatchClass)} />
          {BUILDING_MATERIAL_STYLES[material].label}
        </li>
      ))}
      <li className="flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-0.5 text-body-sm text-on-surface">
        <span aria-hidden="true" className="size-2.5 rounded-sm border-2 border-status-active bg-status-active/30" />
        In progress
      </li>
      <li className="flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-0.5 text-body-sm text-on-surface">
        <span aria-hidden="true" className="size-2.5 rounded-sm border-2 border-status-delayed bg-status-delayed/30" />
        Delayed
      </li>
    </ul>
  );
}
