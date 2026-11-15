import { describe, expect, it } from "vitest";
import { AiConfigError, DEFAULT_AI_MODEL, readAiConfig } from "./config";
import { fixtureName } from "./fixture";
import { parsePlanForm } from "./request";

describe("readAiConfig", () => {
  it("defaults to Gemini and needs a key", () => {
    expect(readAiConfig({ AI_API_KEY: "k" })).toEqual({ provider: "gemini", model: DEFAULT_AI_MODEL, apiKey: "k" });
    expect(() => readAiConfig({})).toThrow(AiConfigError);
  });

  it("picks OpenAI for gpt models and needs no key in fixture mode", () => {
    expect(readAiConfig({ AI_MODEL: "gpt-4o", AI_API_KEY: "k" }).provider).toBe("openai");
    expect(readAiConfig({ AI_MODEL: "fixture" }).provider).toBe("fixture");
  });
});

describe("fixtureName", () => {
  it("maps plano-<name> uploads to their fixture and anything else to the simple plan", () => {
    expect(fixtureName("plano-dos-pisos.png")).toBe("plano-dos-pisos.json");
    expect(fixtureName("IMG_2031.jpg")).toBe("plano-simple.json");
  });
});

describe("parsePlanForm", () => {
  const png = () => new File([new Uint8Array([1, 2, 3])], "plan.png", { type: "image/png" });

  it("reads the file, scale and level", async () => {
    const form = new FormData();
    form.set("file", png());
    form.set("scale", "0.01");
    form.set("level", "2");
    const parsed = await parsePlanForm(form);
    expect(parsed).toMatchObject({ ok: true, request: { fileName: "plan.png", job: { scale: 0.01, level: 2, image: { mimeType: "image/png" } } } });
  });

  it("rejects other file types and a missing scale", async () => {
    const gif = new FormData();
    gif.set("file", new File([new Uint8Array([1])], "plan.gif", { type: "image/gif" }));
    gif.set("scale", "0.01");
    expect(await parsePlanForm(gif)).toEqual({ ok: false, message: "Upload a JPG, PNG or PDF file." });
    const noScale = new FormData();
    noScale.set("file", png());
    expect(await parsePlanForm(noScale)).toMatchObject({ ok: false });
  });
});
