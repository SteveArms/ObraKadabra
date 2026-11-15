import { createVisionModel } from "./client";
import { AiConfigError, readAiConfig } from "./config";
import type { FixtureKind } from "./fixture";
import type { VisionModel } from "./model";

export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

// Shared by the API routes: the configured model, or a 503 when the server has no AI key
export function modelForRequest(fileName: string, kind: FixtureKind): VisionModel | Response {
  try {
    return createVisionModel(readAiConfig(process.env), fileName, kind);
  } catch (error) {
    if (error instanceof AiConfigError) return errorResponse(error.message, 503);
    throw error;
  }
}
