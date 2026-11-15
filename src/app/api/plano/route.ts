import { errorResponse, modelForRequest, ndjsonStream, parsePlanForm, PlanExtractionError, processPlanImage } from "@/lib/ai";

// Reading a plan photo with a vision model takes well over the default limit
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => null);
  if (!form) return errorResponse("Send the plan as multipart form data.", 400);
  const parsed = await parsePlanForm(form);
  if (!parsed.ok) return errorResponse(parsed.message, 400);
  const model = modelForRequest(parsed.request.fileName, "plan");
  if (model instanceof Response) return model;
  const events = processPlanImage(parsed.request.job, model);
  return new Response(ndjsonStream(events, [PlanExtractionError.name]), {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
