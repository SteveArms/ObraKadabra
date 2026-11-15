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

export function extractionPrompt(feedback?: string): string {
  if (!feedback) return EXTRACTION_PROMPT;
  return `${EXTRACTION_PROMPT}\n\nYour previous answer did not match the schema:\n${feedback}\nReturn the corrected JSON only.`;
}
