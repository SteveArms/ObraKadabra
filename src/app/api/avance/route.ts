import { analyzeProgress, errorResponse, modelForRequest, parseProgressForm, ProgressAnalysisError } from "@/lib/ai";

// A vision model comparing a site photo with the plan can take well over the default limit
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => null);
  if (!form) return errorResponse("Send the site photo as multipart form data.", 400);
  const parsed = await parseProgressForm(form);
  if (!parsed.ok) return errorResponse(parsed.message, 400);
  const model = modelForRequest(parsed.request.fileName, "progress");
  if (model instanceof Response) return model;
  try {
    return Response.json(await analyzeProgress(model, parsed.request.image, parsed.request.context), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof ProgressAnalysisError) return errorResponse(error.message, 422);
    return errorResponse("Unable to analyze the photo right now. Try again in a moment.", 502);
  }
}
