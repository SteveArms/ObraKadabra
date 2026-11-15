import { Icon } from "@/components/ui/Icon";
import { WASTE_FACTORS } from "@/data/waste";
import { formatPercent } from "@/lib/format";

export function DidYouKnow() {
  return (
    <aside aria-labelledby="did-you-know" className="flex gap-space-md rounded-lg bg-surface-container-low p-space-lg">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-secondary">
        <Icon name="lightbulb" size={28} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 id="did-you-know" className="font-display text-headline-sm">Did you know?</h2>
        <p className="text-body-md text-pretty text-on-surface-variant">
          ObraKadabra adds the waste that Peruvian builders plan for: <strong className="font-semibold text-on-surface">{formatPercent(WASTE_FACTORS.brick)} on bricks and {formatPercent(WASTE_FACTORS.mortar)} on mortar</strong>. Your shopping list already includes it, so you avoid a second trip to the hardware store.
        </p>
      </div>
    </aside>
  );
}
