"use client";

import { Button } from "@/components/ui/Button";
import { WALL_THICKNESS_BY_KIND } from "@/data/structure";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import { confirmElement, removeElement, setOpeningKind, setWallKind } from "../edits";
import type { CanvasView } from "../hooks/useCanvasView";
import { confidenceLabel, elementLabel } from "../labels";
import { useEditorStore } from "../store";
import { elementAnchor, sameRef } from "../utils";

type Choice = { label: string; apply: (plan: FloorPlan) => FloorPlan; primary?: boolean };
type Question = { title: string; detail: string; choices: [Choice, Choice] };

const cm = (meters: number) => `${Math.round(meters * 100)} cm`;
const POPOVER_WIDTH = 320;

function questionFor(plan: FloorPlan, item: PendingElement): Question {
  const ref = { type: item.type, id: item.id };
  if (item.type === "wall") {
    const thickness = plan.walls.find((wall) => wall.id === item.id)?.thickness ?? 0;
    return {
      title: "Load-bearing wall or partition?",
      detail: `The AI read it as ${cm(thickness)} thick. Check the photo: load-bearing walls carry the slab, partitions only close rooms.`,
      choices: [
        { label: `Load-bearing (${cm(WALL_THICKNESS_BY_KIND.load_bearing)})`, apply: (p) => setWallKind(p, item.id, "load_bearing"), primary: true },
        { label: `Partition (${cm(WALL_THICKNESS_BY_KIND.partition)})`, apply: (p) => setWallKind(p, item.id, "partition") },
      ],
    };
  }
  if (item.type === "opening") {
    return {
      title: "Door or window?",
      detail: "Doors start at floor level. Windows sit on a 0.90 m sill.",
      choices: [{ label: "Door", apply: (p) => setOpeningKind(p, item.id, "door"), primary: true }, { label: "Window", apply: (p) => setOpeningKind(p, item.id, "window") }],
    };
  }
  const noun = item.type === "column" ? "column" : "room";
  return {
    title: item.type === "column" ? "Is there a column here?" : "Is this room outline right?",
    detail: item.type === "column" ? "Columns confine the brick walls at corners and long spans." : "Its area feeds the floor screed in the budget.",
    choices: [{ label: `Keep ${noun}`, apply: (p) => confirmElement(p, ref), primary: true }, { label: `Delete ${noun}`, apply: (p) => removeElement(p, ref) }],
  };
}

// Next to the element on wide screens; a sheet along the bottom of the canvas on phones
export function DecisionPopover({ plan, pending, view }: { plan: FloorPlan; pending: PendingElement[]; view: CanvasView }) {
  const selected = useEditorStore((state) => state.selected);
  const commit = useEditorStore((state) => state.commit);
  const item = pending.find((entry) => sameRef(entry, selected));
  const anchor = item && elementAnchor(plan, item);
  if (!item || !anchor) return null;
  const question = questionFor(plan, item);
  const label = elementLabel(plan, item);
  const at = view.toScreen(anchor);
  const left = Math.min(Math.max(at.x + 24, 8), view.size.width - POPOVER_WIDTH - 8);
  const top = Math.min(Math.max(at.y - 40, 8), view.size.height - 200);
  return (
    <section
      aria-label={`Quick decision for ${label}`}
      data-testid="decision-popover"
      style={{ left, top, width: POPOVER_WIDTH }}
      className="absolute z-20 flex flex-col gap-space-xs rounded-xl bg-surface-container-lowest/95 p-space-sm shadow-overlay backdrop-blur-md max-sm:inset-x-2 max-sm:top-auto! max-sm:bottom-2 max-sm:left-2! max-sm:w-auto!"
    >
      <div className="flex items-center justify-between gap-space-xs">
        <span className="rounded-sm bg-secondary-fixed px-space-xs py-0.5 font-mono text-label-numeric-sm font-semibold text-on-secondary-fixed">{label}</span>
        <span className="font-mono text-label-numeric-sm text-on-surface-variant">{confidenceLabel(item.confidence)}</span>
      </div>
      <h3 className="text-body-md font-semibold">{question.title}</h3>
      <p className="text-body-sm text-pretty text-on-surface-variant">{question.detail}</p>
      <div className="grid grid-cols-2 gap-space-xs pt-1">
        {question.choices.map((choice) => (
          <Button key={choice.label} variant={choice.primary ? "primary" : "ghost"} className="min-h-9 px-space-xs text-body-sm" onClick={() => commit(choice.apply)}>
            {choice.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
