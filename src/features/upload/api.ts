import type { LevelPlan, PlanStreamEvent } from "@/schemas/plan-extraction";
import { rasterFileName } from "./image";
import { readEvents } from "./progress";
import type { Sheet } from "./types";

export const GENERIC_ERROR = "Unable to read the plan right now. Try again in a moment.";

export class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingError";
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "error" in body && typeof body.error === "string") return body.error;
  } catch {
    return GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}

type StepEvent = Extract<PlanStreamEvent, { type: "step" }>;

// Posts one floor to /api/plano and reports each step while the NDJSON answer streams in
export async function readFloor(sheet: Sheet, scale: number, level: number, onStep: (event: StepEvent) => void, signal: AbortSignal): Promise<LevelPlan> {
  const form = new FormData();
  form.set("file", new File([sheet.image.blob], rasterFileName(sheet.fileName, sheet.image), { type: sheet.image.blob.type }));
  form.set("scale", String(scale));
  form.set("level", String(level));
  const response = await fetch("/api/plano", { method: "POST", body: form, signal });
  if (!response.ok || !response.body) throw new ProcessingError(await errorMessage(response));
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    const { events, rest } = readEvents(done ? `${buffer}\n` : buffer + value);
    buffer = rest;
    for (const event of events) {
      if (event.type === "error") throw new ProcessingError(event.message);
      if (event.type === "result") return event.plan;
      onStep(event);
    }
    if (done) throw new ProcessingError(GENERIC_ERROR);
  }
}
