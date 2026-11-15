export type PlanImage = { mimeType: string; base64: string };
export type VisionRequest = { prompt: string; image: PlanImage; schema: Record<string, unknown> };

// A multimodal model reduced to what the pipeline needs: prompt + image in, JSON text out
export type VisionModel = (request: VisionRequest) => Promise<string>;

export class AiRequestError extends Error {
  constructor(status: number) {
    super(`The AI service answered with status ${status}`);
    this.name = "AiRequestError";
  }
}
