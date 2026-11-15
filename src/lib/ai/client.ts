import type { AiConfig } from "./config";
import { fixtureModel } from "./fixture";
import { geminiModel } from "./gemini";
import type { VisionModel } from "./model";
import { openAiModel } from "./openai";

export function createVisionModel(config: AiConfig, fileName: string): VisionModel {
  if (config.provider === "fixture") return fixtureModel(fileName);
  if (config.provider === "openai") return openAiModel(config.model, config.apiKey);
  return geminiModel(config.model, config.apiKey);
}
