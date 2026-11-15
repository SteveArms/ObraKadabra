"use client";

import { useId, useState } from "react";
import { formatArea } from "@/lib/format";
import { polygonArea, wallLength } from "@/lib/geometry";
import type { Column, FloorPlan, Opening, Room } from "@/schemas/floor-plan";
import { patchColumn, patchOpening, patchRoom, setOpeningKind } from "../edits";
import { useEditorStore } from "../store";
import { ChoiceGroup } from "./ChoiceGroup";
import { MeterField, ReadOnlyField } from "./MeterField";

const OPENING_KINDS = [
  { value: "door" as const, label: "Door", description: "Starts at floor level." },
  { value: "window" as const, label: "Window", description: "Sits on a sill above the floor." },
];

export function OpeningProperties({ plan, opening }: { plan: FloorPlan; opening: Opening }) {
  const commit = useEditorStore((state) => state.commit);
  const wall = plan.walls.find((item) => item.id === opening.wallId);
  const wallMeters = wall ? wallLength(wall) * plan.meta.scale : opening.width;
  // A wider opening keeps its center and stays inside its wall
  const setWidth = (width: number) => {
    const fitted = Math.min(width, wallMeters);
    const offset = Math.min(Math.max(opening.offset + (opening.width - fitted) / 2, 0), wallMeters - fitted);
    commit((p) => patchOpening(p, opening.id, { width: fitted, offset }));
  };
  const field = (key: "width" | "height" | "sill", label: string, onCommit: (value: number) => void) => (
    <MeterField key={`${opening.id}-${key}-${opening[key]}`} label={label} value={opening[key]} onCommit={onCommit} min={key === "sill" ? 0 : 0.3} />
  );
  return (
    <div className="flex flex-col gap-space-md">
      <ChoiceGroup legend="Type" name={`opening-${opening.id}`} value={opening.kind} options={OPENING_KINDS} onChange={(kind) => commit((p) => setOpeningKind(p, opening.id, kind))} />
      <div className="grid grid-cols-2 gap-space-sm">
        {field("width", "Width", setWidth)}
        {field("height", "Height", (height) => commit((p) => patchOpening(p, opening.id, { height })))}
        {opening.kind === "window" ? field("sill", "Sill height", (sill) => commit((p) => patchOpening(p, opening.id, { sill }))) : null}
        <ReadOnlyField label="In wall" value={opening.wallId} />
      </div>
    </div>
  );
}

export function ColumnProperties({ column }: { column: Column }) {
  const commit = useEditorStore((state) => state.commit);
  return (
    <div className="grid grid-cols-2 gap-space-sm">
      <MeterField key={`${column.id}-w-${column.w}`} label="Width" value={column.w} min={0.15} onCommit={(w) => commit((p) => patchColumn(p, column.id, { w }))} />
      <MeterField key={`${column.id}-d-${column.d}`} label="Depth" value={column.d} min={0.15} onCommit={(d) => commit((p) => patchColumn(p, column.id, { d }))} />
    </div>
  );
}

export function RoomProperties({ plan, room }: { plan: FloorPlan; room: Room }) {
  const commit = useEditorStore((state) => state.commit);
  const id = useId();
  const [name, setName] = useState(room.name);
  const save = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== room.name) commit((p) => patchRoom(p, room.id, { name: trimmed }));
    else setName(room.name);
  };
  return (
    <div className="grid grid-cols-2 gap-space-sm">
      <div className="col-span-2 flex flex-col gap-1">
        <label htmlFor={id} className="text-body-sm text-on-surface-variant">
          Name
        </label>
        <input id={id} value={name} autoComplete="off" onChange={(event) => setName(event.target.value)} onBlur={save} onKeyDown={(event) => event.key === "Enter" && save()} className="min-h-9 rounded-md border border-outline-variant bg-surface-container-lowest px-space-xs text-body-md" />
      </div>
      <ReadOnlyField label="Area" value={formatArea(polygonArea(room.polygon) * plan.meta.scale ** 2)} />
    </div>
  );
}
