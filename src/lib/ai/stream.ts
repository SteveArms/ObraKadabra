import type { PlanStreamEvent } from "@/schemas/plan-extraction";

// Expected failures carry a user-facing message; anything else gets a generic one so internals never leak
function errorEvent(error: unknown, knownErrors: string[]): PlanStreamEvent {
  if (error instanceof Error && knownErrors.includes(error.name)) return { type: "error", message: error.message };
  return { type: "error", message: "Unable to read the plan right now. Try again in a moment." };
}

export function ndjsonStream(events: AsyncGenerator<PlanStreamEvent>, knownErrors: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of events) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      } catch (error) {
        controller.enqueue(encoder.encode(`${JSON.stringify(errorEvent(error, knownErrors))}\n`));
      }
      controller.close();
    },
  });
}
