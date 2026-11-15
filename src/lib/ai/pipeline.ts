import { pendingElements } from "@/lib/plan";
import type { PlanStreamEvent } from "@/schemas/plan-extraction";
import { toLevelPlan } from "./convert";
import { extractPlan } from "./extract";
import type { PlanImage, VisionModel } from "./model";

export type PlanJob = { image: PlanImage; scale: number; level: number };

function count<T>(items: T[], test: (item: T) => boolean): number {
  return items.filter(test).length;
}

// Emits one event per finished stage so the processing screen ticks its steps with real counts
export async function* processPlanImage(job: PlanJob, model: VisionModel): AsyncGenerator<PlanStreamEvent> {
  const extracted = await extractPlan(model, job.image);
  yield { type: "step", step: "reading", counts: { dimensions: extracted.dimensions.length } };
  const plan = toLevelPlan(extracted, job.scale, job.level);
  const { walls, openings, rooms } = plan;
  yield {
    type: "step",
    step: "walls",
    counts: { total: walls.length, loadBearing: count(walls, (wall) => wall.kind === "load_bearing"), partition: count(walls, (wall) => wall.kind === "partition") },
  };
  yield { type: "step", step: "openings", counts: { doors: count(openings, (o) => o.kind === "door"), windows: count(openings, (o) => o.kind === "window") } };
  yield { type: "step", step: "rooms", counts: { total: rooms.length }, names: rooms.map((room) => room.name) };
  yield { type: "result", plan, pending: pendingElements(plan) };
}
