"use client";

import { useId } from "react";
import { WALL_THICKNESSES } from "@/data/structure";
import { formatMeters } from "@/lib/format";
import { wallLength } from "@/lib/geometry";
import { levelClearHeight } from "@/lib/plan";
import type { FloorPlan, Wall, WallKind } from "@/schemas/floor-plan";
import { patchWall, setWallKind } from "../edits";
import { useEditorStore } from "../store";
import { confiningColumns } from "../utils";
import { setWallLength } from "../vertices";
import { ChoiceGroup } from "./ChoiceGroup";
import { MeterField, ReadOnlyField } from "./MeterField";

const KINDS: { value: WallKind; label: string; description: string }[] = [
  { value: "load_bearing", label: "Load-bearing (King Kong brick)", description: "Carries the slab. Usually laid in cabeza bond." },
  { value: "partition", label: "Partition (pandereta brick)", description: "Not structural. It only closes rooms." },
];

const BOND: Record<number, string> = { 0.15: "soga", 0.25: "cabeza" };

export function WallProperties({ plan, wall }: { plan: FloorPlan; wall: Wall }) {
  const commit = useEditorStore((state) => state.commit);
  const thicknessId = useId();
  const length = wallLength(wall) * plan.meta.scale;
  const thicknesses = [...new Set([...WALL_THICKNESSES, wall.thickness])].sort((a, b) => a - b);
  const columns = confiningColumns(plan, wall.id);
  return (
    <div className="flex flex-col gap-space-md">
      <ChoiceGroup legend="Structural type" name={`kind-${wall.id}`} value={wall.kind} options={KINDS} onChange={(kind) => commit((p) => setWallKind(p, wall.id, kind))} />
      <div className="grid grid-cols-2 gap-space-sm">
        <MeterField key={`${wall.id}-${length.toFixed(3)}`} label="Length" testId="wall-length" value={length} onCommit={(meters) => commit((p) => setWallLength(p, wall.id, meters))} />
        <div className="flex flex-col gap-1">
          <label htmlFor={thicknessId} className="text-body-sm text-on-surface-variant">
            Thickness
          </label>
          <select
            id={thicknessId}
            value={String(wall.thickness)}
            onChange={(event) => commit((p) => patchWall(p, wall.id, { thickness: Number(event.target.value) }))}
            className="min-h-9 min-w-0 rounded-md border border-outline-variant bg-surface-container-lowest px-space-xs text-body-md tabular-nums"
          >
            {thicknesses.map((value) => (
              <option key={value} value={String(value)}>
                {formatMeters(value)}
                {BOND[value] ? ` (${BOND[value]})` : ""}
              </option>
            ))}
          </select>
        </div>
        <ReadOnlyField label="Clear height" value={formatMeters(levelClearHeight(plan, wall.level))} />
        <ReadOnlyField label="Confined by" testId="wall-confinement" value={columns.length ? columns.join(" and ") : "No columns"} />
      </div>
    </div>
  );
}
