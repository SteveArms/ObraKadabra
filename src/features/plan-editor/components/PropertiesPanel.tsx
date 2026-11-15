"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import { confirmElement, findElement } from "../edits";
import { elementLabel } from "../labels";
import { useEditorStore } from "../store";
import type { ElementRef } from "../types";
import { sameRef } from "../utils";
import { ElementMaterials } from "./ElementMaterials";
import { ColumnProperties, OpeningProperties, RoomProperties } from "./OtherProperties";
import { PendingList } from "./PendingList";
import { WallProperties } from "./WallProperties";

function ElementFields({ plan, selected }: { plan: FloorPlan; selected: ElementRef }) {
  const wall = selected.type === "wall" ? plan.walls.find((item) => item.id === selected.id) : undefined;
  const opening = selected.type === "opening" ? plan.openings.find((item) => item.id === selected.id) : undefined;
  const column = selected.type === "column" ? plan.columns.find((item) => item.id === selected.id) : undefined;
  const room = selected.type === "room" ? plan.rooms.find((item) => item.id === selected.id) : undefined;
  return (
    <>
      {wall ? <WallProperties plan={plan} wall={wall} /> : null}
      {opening ? <OpeningProperties plan={plan} opening={opening} /> : null}
      {column ? <ColumnProperties column={column} /> : null}
      {room ? <RoomProperties key={`${room.id}-${room.name}`} plan={plan} room={room} /> : null}
      <ElementMaterials plan={plan} elementId={selected.id} />
    </>
  );
}

export function PropertiesPanel({ plan, pending }: { plan: FloorPlan; pending: PendingElement[] }) {
  const selected = useEditorStore((state) => state.selected);
  const commit = useEditorStore((state) => state.commit);
  const current = selected && findElement(plan, selected) ? selected : undefined;
  const isPending = pending.some((item) => sameRef(item, current));
  const label = current ? elementLabel(plan, current) : undefined;
  return (
    <aside aria-labelledby="properties-title" data-testid="properties-panel" data-element-id={current?.id ?? ""} className="flex min-h-0 flex-col bg-surface-container-lowest">
      <div className="flex items-start justify-between gap-space-sm bg-surface-container-low p-space-md">
        <div className="flex flex-col gap-0.5">
          <h2 id="properties-title" className="flex items-center gap-1.5 font-display text-headline-sm">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", isPending ? "bg-secondary-container" : current ? "bg-status-done" : "bg-status-idle")} />
            Properties
          </h2>
          <p data-testid="selected-label" className="font-mono text-label-numeric-sm text-secondary">{label ?? "Nothing selected"}</p>
        </div>
        {current ? (
          <span className={cn("rounded-sm px-space-xs py-0.5 font-mono text-label-numeric-sm font-semibold", isPending ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-status-done/12 text-status-done-text")}>
            {isPending ? "To review" : "Confirmed"}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-space-lg p-space-md lg:overflow-y-auto lg:overscroll-contain">
        {current ? <ElementFields plan={plan} selected={current} /> : <p className="text-body-md text-pretty text-on-surface-variant">Select an element on the plan, or use Review next to go through the ones the AI was unsure about.</p>}
        <PendingList plan={plan} pending={pending} />
      </div>
      {current && isPending && label ? (
        <div className="border-t border-line p-space-md">
          <Button className="w-full" onClick={() => commit((p) => confirmElement(p, current))}>
            <Icon name="check_circle" size={18} />
            Validate {current.id}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
