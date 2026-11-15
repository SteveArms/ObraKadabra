import { z } from "zod";
import { AiRequestError, type VisionModel } from "./model";

const GeminiResponseSchema = z.object({
  candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string().optional() })) }) })).min(1),
});

export function geminiModel(model: string, apiKey: string): VisionModel {
  return async ({ prompt, image, schema }) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: image.mimeType, data: image.base64 } }] }],
        generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema, temperature: 0 },
      }),
    });
    if (!response.ok) throw new AiRequestError(response.status);
    const parsed = GeminiResponseSchema.parse(await response.json());
    return parsed.candidates[0].content.parts.map((part) => part.text ?? "").join("");
  };
}
