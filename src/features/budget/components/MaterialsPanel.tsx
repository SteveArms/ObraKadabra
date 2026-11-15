"use client";

import { useMemo } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatSoles } from "@/lib/format";
import { materialsForWeek } from "@/lib/schedule";
import type { Schedule } from "@/schemas/schedule";
import { useMaterialSelection } from "../hooks/useMaterialSelection";
import { purchaseCost, shoppingListMessage, whatsappUrl } from "../utils";
import { MaterialRow } from "./MaterialRow";

type MaterialsPanelProps = { schedule: Schedule; week: number; projectName: string };

export function MaterialsPanel({ schedule, week, projectName }: MaterialsPanelProps) {
  const entries = useMemo(() => materialsForWeek(schedule, week), [schedule, week]);
  const { isChosen, toggle } = useMaterialSelection(week);
  const chosen = entries.filter((entry) => isChosen(entry.material));
  const subtotal = chosen.reduce((sum, entry) => sum + purchaseCost(entry), 0);

  if (entries.length === 0) return <MaterialsEmpty week={week} />;

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <h3 className="font-display text-headline-sm">Materials for week {week}</h3>
        <p className="text-body-md text-on-surface-variant">What to buy so the work does not stop.</p>
      </div>
      <ul data-testid="materials-list" className="flex flex-col gap-space-xs">
        {entries.map((entry) => (
          <MaterialRow key={entry.material} entry={entry} checked={isChosen(entry.material)} onToggle={() => toggle(entry.material)} />
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-line pt-space-xs">
        <span className="text-body-md">Selected subtotal</span>
        <span data-testid="materials-subtotal" className="font-mono text-label-numeric-lg tabular-nums">{formatSoles(subtotal)}</span>
      </div>
      <a
        href={whatsappUrl(shoppingListMessage(projectName, week, chosen))}
        target="_blank"
        rel="noreferrer"
        data-testid="materials-whatsapp"
        className={buttonClasses("primary", "w-full")}
      >
        <Icon name="chat" />
        Send list to my hardware store on WhatsApp
      </a>
    </div>
  );
}

function MaterialsEmpty({ week }: { week: number }) {
  return (
    <div data-testid="materials-empty" className="flex flex-col gap-1">
      <p className="font-display text-headline-sm">Nothing to buy in week {week}</p>
      <p className="text-body-md text-on-surface-variant">This week is labor only, such as excavation. Move to another week to see its list.</p>
    </div>
  );
}
