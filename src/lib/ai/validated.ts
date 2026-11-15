import { z } from "zod";
import type { PlanImage, VisionModel } from "./model";

export type Checked<T> = { ok: true; value: T } | { ok: false; feedback: string };

export function parseJsonWith<T>(raw: string, schema: z.ZodType<T>): Checked<T> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, feedback: "The answer was not valid JSON." };
  }
  const result = schema.safeParse(json);
  return result.success ? { ok: true, value: result.data } : { ok: false, feedback: z.prettifyError(result.error) };
}

type ValidatedRequest<T> = {
  image: PlanImage;
  schema: Record<string, unknown>;
  prompt: (feedback?: string) => string;
  check: (raw: string) => Checked<T>;
  failure: () => Error;
};

// Every AI answer is validated before use: one retry with the validation errors as feedback, then a user-facing error
export async function generateValidated<T>(model: VisionModel, request: ValidatedRequest<T>): Promise<T> {
  let feedback: string | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const checked = request.check(await model({ prompt: request.prompt(feedback), image: request.image, schema: request.schema }));
    if (checked.ok) return checked.value;
    feedback = checked.feedback;
  }
  throw request.failure();
}
