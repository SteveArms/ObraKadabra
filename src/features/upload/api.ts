import { failureFromResponse, networkFailure, RequestFailure } from "@/lib/http";
import type { LevelPlan, PlanStreamEvent } from "@/schemas/plan-extraction";
import { rasterFileName } from "./image";
import { readEvents } from "./progress";
import type { Sheet } from "./types";

export const GENERIC_ERROR = "Unable to read the plan right now. Try again in a moment.";


type StepEvent = Extract<PlanStreamEvent, { type: "step" }>;

// Posts one floor to /api/plano and reports each step while the NDJSON answer streams in
export async function readFloor(sheet: Sheet, scale: number, level: number, onStep: (event: StepEvent) => void, signal: AbortSignal): Promise<LevelPlan> {
  const form = new FormData();
  form.set("file", new File([sheet.image.blob], rasterFileName(sheet.fileName, sheet.image), { type: sheet.image.blob.type }));
  form.set("scale", String(scale));
  form.set("level", String(level));
  const response = await fetch("/api/plano", { method: "POST", body: form, signal }).catch((error: unknown) => {
    throw signal.aborted ? error : networkFailure(GENERIC_ERROR);
  });
  if (!response.ok || !response.body) throw await failureFromResponse(response, GENERIC_ERROR);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    const { events, rest } = readEvents(done ? `${buffer}\n` : buffer + value);
    buffer = rest;
    for (const event of events) {
      // The model answered but could not read this plan, so a new photo helps more than a demo
      if (event.type === "error") throw new RequestFailure(event.message, "request");
      if (event.type === "result") return event.plan;
      onStep(event);
    }
    if (done) throw new RequestFailure(GENERIC_ERROR, "service");
  }
}
