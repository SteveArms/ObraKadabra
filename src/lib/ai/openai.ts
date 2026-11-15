import { z } from "zod";
import { AiRequestError, type VisionModel } from "./model";

const OpenAiResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
});

export function openAiModel(model: string, apiKey: string): VisionModel {
  return async ({ prompt, image, schema }) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } },
            ],
          },
        ],
        response_format: { type: "json_schema", json_schema: { name: "floor_plan", schema, strict: false } },
      }),
    });
    if (!response.ok) throw new AiRequestError(response.status);
    return OpenAiResponseSchema.parse(await response.json()).choices[0].message.content;
  };
}
