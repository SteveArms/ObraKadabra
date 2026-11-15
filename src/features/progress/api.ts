import { ProgressAnalysisSchema, type ProgressAnalysis, type ProgressContext } from "@/schemas/progress";

export const GENERIC_ERROR = "Unable to analyze the photo right now. Check your connection and try again.";

export class ProgressRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProgressRequestError";
  }
}

async function errorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  const message = body && typeof body === "object" && "error" in body ? body.error : null;
  return typeof message === "string" && message ? message : GENERIC_ERROR;
}

// The answer is validated again in the browser, so a broken response never reaches the findings list
export async function analyzePhoto(photo: Blob, fileName: string, context: ProgressContext): Promise<ProgressAnalysis> {
  const form = new FormData();
  form.append("file", photo, fileName);
  form.append("context", JSON.stringify(context));
  const response = await fetch("/api/avance", { method: "POST", body: form }).catch(() => null);
  if (!response) throw new ProgressRequestError(GENERIC_ERROR);
  if (!response.ok) throw new ProgressRequestError(await errorMessage(response));
  const parsed = ProgressAnalysisSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ProgressRequestError(GENERIC_ERROR);
  return parsed.data;
}
