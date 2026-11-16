import { describe, expect, it } from "vitest";
import { edgeStrength, isBlurry, sharpnessScore, toGray } from "./sharpness";

const SIZE = 64;

// Paper with dark one-pixel walls every 16 px, like a line drawing
function linePlan(ink = 20, paper = 255): Float32Array {
  const gray = new Float32Array(SIZE * SIZE).fill(paper);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (x % 16 === 0 || y % 16 === 0) gray[y * SIZE + x] = ink;
  return gray;
}

function boxBlur(gray: Float32Array, radius: number): Float32Array {
  const out = new Float32Array(gray.length);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
        const nx = Math.min(SIZE - 1, Math.max(0, x + dx));
        const ny = Math.min(SIZE - 1, Math.max(0, y + dy));
        sum += gray[ny * SIZE + nx];
        count++;
      }
      out[y * SIZE + x] = sum / count;
    }
  }
  return out;
}

describe("sharpness", () => {
  it("converts RGBA pixels to luminance", () => {
    expect(Array.from(toGray(new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])))).toEqual([255, 0]);
  });

  it("keeps a crisp line drawing and flags the same drawing blurred", () => {
    const sharp = linePlan();
    expect(isBlurry(sharp, SIZE, SIZE)).toBe(false);
    expect(isBlurry(boxBlur(sharp, 1), SIZE, SIZE)).toBe(false);
    // Three box passes approximate the gaussian smear of a shaken phone photo
    expect(isBlurry(boxBlur(boxBlur(boxBlur(sharp, 2), 2), 2), SIZE, SIZE)).toBe(true);
    expect(edgeStrength(sharp, SIZE, SIZE)).toBeGreaterThan(edgeStrength(boxBlur(sharp, 1), SIZE, SIZE));
  });

  it("does not mistake a dim but focused photo for a blurry one", () => {
    expect(sharpnessScore(linePlan(90, 170), SIZE, SIZE)).toBeCloseTo(sharpnessScore(linePlan(), SIZE, SIZE), 1);
    expect(isBlurry(linePlan(90, 170), SIZE, SIZE)).toBe(false);
  });

  it("treats a blank page as blurry instead of failing", () => {
    expect(isBlurry(new Float32Array(SIZE * SIZE).fill(255), SIZE, SIZE)).toBe(true);
    expect(edgeStrength(new Float32Array(1), 1, 1)).toBe(0);
  });
});
