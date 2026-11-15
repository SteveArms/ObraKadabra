export type AiProvider = "gemini" | "openai" | "fixture";
export type AiConfig = { provider: AiProvider; model: string; apiKey: string };

export const DEFAULT_AI_MODEL = "gemini-3.5-flash";
export const FIXTURE_MODEL = "fixture";

export class AiConfigError extends Error {
  constructor() {
    super("The plan reader is not set up on this server. Try again later or open a demo project.");
    this.name = "AiConfigError";
  }
}

function providerFor(model: string): AiProvider {
  if (model === FIXTURE_MODEL) return "fixture";
  return /^(gpt|o[0-9])/.test(model) ? "openai" : "gemini";
}

// AI_MODEL picks the provider by name (gemini-*, gpt-*); "fixture" answers from e2e/fixtures without a key
export function readAiConfig(env: Record<string, string | undefined>): AiConfig {
  const model = env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;
  const provider = providerFor(model);
  const apiKey = env.AI_API_KEY?.trim() ?? "";
  if (provider !== "fixture" && !apiKey) throw new AiConfigError();
  return { provider, model, apiKey };
}
