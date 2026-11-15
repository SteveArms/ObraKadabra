// Plans are mostly white paper, so sharpness is read from the strongest edges only (the top 1%), not from the whole image
const EDGE_SHARE = 0.01;

// Score per unit of contrast on the test plan at 640 px: crisp above 1, 1 px blur 0.2 (readable), 2 px blur 0.06 (walls smear)
export const BLURRY_SCORE = 0.1;

export function toGray(rgba: Uint8ClampedArray): Float32Array {
  const gray = new Float32Array(rgba.length / 4);
  for (let index = 0; index < gray.length; index++) gray[index] = 0.299 * rgba[index * 4] + 0.587 * rgba[index * 4 + 1] + 0.114 * rgba[index * 4 + 2];
  return gray;
}

// Mean of the top 1% absolute Laplacian responses: crisp ink lines give hundreds, a blurred photo only a few dozen
export function edgeStrength(gray: Float32Array, width: number, height: number): number {
  const responses: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const at = y * width + x;
      responses.push(Math.abs(4 * gray[at] - gray[at - 1] - gray[at + 1] - gray[at - width] - gray[at + width]));
    }
  }
  if (responses.length === 0) return 0;
  responses.sort((a, b) => b - a);
  const top = responses.slice(0, Math.max(1, Math.round(responses.length * EDGE_SHARE)));
  return top.reduce((sum, value) => sum + value, 0) / top.length;
}

// Paper to ink range, ignoring the 1% darkest and lightest pixels (glare, specks)
export function contrast(gray: Float32Array): number {
  if (gray.length === 0) return 0;
  const sorted = Array.from(gray).sort((a, b) => a - b);
  const at = (share: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];
  return at(0.99) - at(0.01);
}

// Dividing by the contrast keeps a dim but focused photo from looking blurry
export function sharpnessScore(gray: Float32Array, width: number, height: number): number {
  const range = contrast(gray);
  return range < 1 ? 0 : edgeStrength(gray, width, height) / range;
}

export function isBlurry(gray: Float32Array, width: number, height: number): boolean {
  return sharpnessScore(gray, width, height) < BLURRY_SCORE;
}
