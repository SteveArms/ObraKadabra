import {
  AiConfigError,
  createVisionModel,
  ndjsonStream,
  parsePlanForm,
  PlanExtractionError,
  processPlanImage,
  readAiConfig,
  type VisionModel,
} from "@/lib/ai";

// Reading a plan photo with a vision model takes well over the default limit
export const maxDuration = 60;

function failure(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function modelFor(fileName: string): VisionModel | Response {
  try {
    return createVisionModel(readAiConfig(process.env), fileName);
  } catch (error) {
    if (error instanceof AiConfigError) return failure(error.message, 503);
    throw error;
  }
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => null);
  if (!form) return failure("Send the plan as multipart form data.", 400);
  const parsed = await parsePlanForm(form);
  if (!parsed.ok) return failure(parsed.message, 400);
  const model = modelFor(parsed.request.fileName);
  if (model instanceof Response) return model;
  const events = processPlanImage(parsed.request.job, model);
  return new Response(ndjsonStream(events, [PlanExtractionError.name]), {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
