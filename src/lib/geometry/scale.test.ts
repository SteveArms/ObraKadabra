import { describe, expect, it } from "vitest";
import { metersPerPixel, metersToPixels, pixelsToMeters } from "./scale";

describe("metersPerPixel", () => {
  it("divides the real distance by the clicked distance", () => {
    expect(metersPerPixel({ x: 100, y: 50 }, { x: 900, y: 50 }, 8)).toBeCloseTo(0.01);
  });

  it("works on diagonals", () => {
    expect(metersPerPixel({ x: 0, y: 0 }, { x: 300, y: 400 }, 5)).toBeCloseTo(0.01);
  });

  it("rejects the same point twice or a non-positive distance", () => {
    expect(metersPerPixel({ x: 1, y: 1 }, { x: 1, y: 1 }, 3)).toBeNull();
    expect(metersPerPixel({ x: 0, y: 0 }, { x: 10, y: 0 }, 0)).toBeNull();
    expect(metersPerPixel({ x: 0, y: 0 }, { x: 10, y: 0 }, Number.NaN)).toBeNull();
  });
});

describe("pixel and meter conversion", () => {
  it("round-trips through the scale", () => {
    expect(pixelsToMeters(250, 0.01)).toBeCloseTo(2.5);
    expect(metersToPixels(2.5, 0.01)).toBeCloseTo(250);
  });
});
