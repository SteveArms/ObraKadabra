import { Icon } from "@/components/ui/Icon";
import { formatSoles } from "@/lib/format";
import { MATERIAL_LABELS, UNIT_LABELS, elementTakeoff } from "@/lib/takeoff";
import type { FloorPlan } from "@/schemas/floor-plan";

const quantity = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

// The 5D side of the selection: what this element alone consumes and costs, recomputed on every edit
export function ElementMaterials({ plan, elementId }: { plan: FloorPlan; elementId: string }) {
  const takeoff = elementTakeoff(plan, elementId);
  if (takeoff.materials.length === 0 && takeoff.cost === 0) return null;
  return (
    <section aria-labelledby="element-materials" className="flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
      <h3 id="element-materials" className="flex items-center justify-between text-body-md font-semibold">
        Takeoff for {elementId}
        <Icon name="calculate" size={18} className="text-tertiary" />
      </h3>
      <dl data-testid="element-materials" className="flex flex-col gap-1 text-body-sm">
        {takeoff.materials.map((entry) => (
          <div key={entry.material} className="flex justify-between gap-space-sm">
            <dt className="text-on-surface-variant">{MATERIAL_LABELS[entry.material]}</dt>
            <dd className="font-mono tabular-nums">
              {quantity.format(entry.quantity)} {UNIT_LABELS[entry.unit]}
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-space-sm border-t border-line pt-1 font-semibold text-primary">
          <dt>Estimated cost</dt>
          <dd data-testid="element-cost" className="font-mono tabular-nums">
            {formatSoles(takeoff.cost)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
