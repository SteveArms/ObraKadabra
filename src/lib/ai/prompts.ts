import type { ProgressContext } from "@/schemas/progress";

const EXTRACTION_PROMPT = [
  "You read architectural floor plans of Peruvian confined-masonry homes.",
  "Return every wall, door, window, column and room drawn in the image as JSON that follows the schema.",
  "Units: every coordinate and length is in pixels of this image, with the origin at the top-left corner.",
  "Walls: one straight segment per wall from (x1, y1) to (x2, y2) along its center line; thickness is the drawn thickness.",
  'kind is "load_bearing" for thick structural walls (usually 0.25 m) and "partition" for thin ones (usually 0.15 m).',
  "Openings: wallId is the id of the wall that contains it; offset is the distance from that wall's (x1, y1) end to the near edge of the opening; width is its size along the wall.",
  "Columns: the filled squares at wall corners and intersections; (x, y) is the center, w and d the drawn size.",
  'Rooms: the closed area of each room as a polygon; name is the label written inside it, or "" when there is none.',
  "Dimensions: every legible dimension line, with its text, its value in meters and its two end points.",
  "confidence (0 to 1) is how sure you are that the element exists exactly as returned. Use low values instead of guessing.",
  "Do not invent elements that are not drawn.",
].join("\n");

function withFeedback(prompt: string, feedback?: string): string {
  if (!feedback) return prompt;
  return `${prompt}\n\nYour previous answer did not match the schema:\n${feedback}\nReturn the corrected JSON only.`;
}

export function extractionPrompt(feedback?: string): string {
  return withFeedback(EXTRACTION_PROMPT, feedback);
}

const PROGRESS_PROMPT = [
  "You inspect site photos of Peruvian confined-masonry homes under construction.",
  "Compare the photo with the elements planned for this week and report what was built, as JSON that follows the schema.",
  'status: "done" when the element is fully built (columns poured and formwork removed, walls up to the beam), "in_progress" when it is partly built, "not_started" when its place is visible but empty.',
  "percent: your estimate from 0 to 100 of how much of that element is built.",
  "evidence: one short sentence on what in the photo supports the status.",
  "confidence (0 to 1): how sure you are; use low values when the element is hidden, cropped or out of frame.",
  "Only report elements from the list, with the same id and type. Leave out elements you cannot see.",
].join("\n");

export function progressPrompt(context: ProgressContext, feedback?: string): string {
  const where = context.sector ? `${context.levelLabel}, ${context.sector}` : context.levelLabel;
  const list = context.expected.map((element) => `- ${element.id} (${element.type}, stage ${element.stage})`).join("\n");
  return withFeedback(`${PROGRESS_PROMPT}\n\nWeek ${context.week} · ${where}.\nExpected elements:\n${list}`, feedback);
}
