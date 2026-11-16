import { failureFromResponse, networkFailure, RequestFailure } from "@/lib/http";
import { ProgressAnalysisSchema, type ProgressAnalysis, type ProgressContext } from "@/schemas/progress";

export const GENERIC_ERROR = "Unable to analyze the photo right now. Check your connection and try again.";
export const TIMEOUT_ERROR = "The analysis took too long. Try again, or take a photo of a smaller area.";

// Two model attempts on the server fit well inside this; past it the user gets a way out instead of a spinner
export const ANALYSIS_TIMEOUT_MS = 100_000;


// The answer is validated again in the browser, so a broken response never reaches the findings list
export async function analyzePhoto(photo: Blob, fileName: string, context: ProgressContext, timeoutMs = ANALYSIS_TIMEOUT_MS): Promise<ProgressAnalysis> {
  const form = new FormData();
  form.append("file", photo, fileName);
  form.append("context", JSON.stringify(context));
  const signal = AbortSignal.timeout(timeoutMs);
  const response = await fetch("/api/avance", { method: "POST", body: form, signal }).catch(() => null);
  if (!response) throw signal.aborted ? new RequestFailure(TIMEOUT_ERROR, "timeout") : networkFailure(GENERIC_ERROR);
  if (!response.ok) throw await failureFromResponse(response, GENERIC_ERROR);
  const parsed = ProgressAnalysisSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new RequestFailure(GENERIC_ERROR, "service");
  return parsed.data;
}
