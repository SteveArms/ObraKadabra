import { describe, expect, it } from "vitest";
import type { Sheet } from "./types";
import { DEFAULT_DETAILS, NO_EDITS } from "./store";
import { calibrationError, detailsErrors, formatScale, parseMeters, rotateRect, sheetScale, uploadError } from "./utils";

const raster = { blob: new Blob(), url: "blob:x", width: 1000, height: 800 };

function sheet(points: Sheet["calibration"]["points"], meters: string): Sheet {
  return { id: "s1", fileName: "plan.png", source: raster, image: raster, edits: NO_EDITS, calibration: { points, meters } };
}

describe("calibration", () => {
  it("parses meters with a dot or a comma", () => {
    expect(parseMeters("8.00")).toBe(8);
    expect(parseMeters("8,5")).toBe(8.5);
    expect(parseMeters("")).toBeNull();
    expect(parseMeters("-2")).toBeNull();
  });

  it("turns two points and a distance into meters per pixel", () => {
    const scale = sheetScale(sheet([{ x: 100, y: 60 }, { x: 900, y: 60 }], "8.00"));
    expect(scale).toBeCloseTo(0.01);
    expect(formatScale(scale ?? 0)).toBe("1 px = 0.0100 m");
  });

  it("asks for points first, then for the distance", () => {
    expect(calibrationError([sheet([{ x: 1, y: 1 }], "8")])?.message).toMatch(/two points/);
    expect(calibrationError([sheet([{ x: 1, y: 1 }, { x: 9, y: 1 }], "")])?.message).toMatch(/real distance/);
    expect(calibrationError([sheet([{ x: 1, y: 1 }, { x: 9, y: 1 }], "8")])).toBeNull();
  });
});

describe("step validation", () => {
  it("needs at least one plan", () => {
    expect(uploadError([])).toMatch(/Add a photo/);
    expect(uploadError([sheet([], "")])).toBeNull();
  });

  it("rejects a floor height under 2.40 m and an empty name", () => {
    expect(detailsErrors({ ...DEFAULT_DETAILS, name: "Casa", floorHeight: "2.20" }, 1)).toEqual({ floorHeight: "Use a floor height of at least 2.40 m." });
    expect(detailsErrors({ ...DEFAULT_DETAILS, name: "Casa", floorHeight: "2.60" }, 1)).toEqual({});
    expect(detailsErrors({ ...DEFAULT_DETAILS, name: " " }, 1).name).toBeDefined();
  });

  it("needs as many floors as uploaded plans", () => {
    expect(detailsErrors({ ...DEFAULT_DETAILS, name: "Casa", levels: 1 }, 2).levels).toMatch(/at least 2/);
  });
});

describe("rotateRect", () => {
  it("follows the image when it turns 90° clockwise", () => {
    expect(rotateRect({ x: 10, y: 20, width: 100, height: 50 }, 800)).toEqual({ x: 730, y: 10, width: 50, height: 100 });
  });
});
