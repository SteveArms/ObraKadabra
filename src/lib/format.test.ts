import { describe, expect, it } from "vitest";
import { formatArea, formatBytes, formatCount, formatMeters, formatPercent, formatScale, formatSignedSoles, formatSoles, parseMeters } from "./format";

describe("format", () => {
  it("formats soles without decimals", () => {
    expect(formatSoles(44858.1)).toBe("S/ 44,858");
    expect(formatSoles(0)).toBe("S/ 0");
  });

  it("formats areas and counts", () => {
    expect(formatArea(90)).toBe("90 m²");
    expect(formatArea(12.25)).toBe("12.3 m²");
    expect(formatCount(1, "floor", "floors")).toBe("1 floor");
    expect(formatCount(2, "floor", "floors")).toBe("2 floors");
    expect(formatPercent(0.425)).toBe("42.5%");
  });

  it("parses meters with a dot or a comma", () => {
    expect(parseMeters("8.00")).toBe(8);
    expect(parseMeters("8,5")).toBe(8.5);
    expect(parseMeters("")).toBeNull();
    expect(parseMeters("-2")).toBeNull();
  });

  it("formats lengths and the plan scale", () => {
    expect(formatMeters(3.456)).toBe("3.46 m");
    expect(formatScale(0.01)).toBe("1 px = 0.0100 m");
  });

  it("formats budget variance with its sign and file sizes", () => {
    expect(formatSignedSoles(140.4)).toBe("+S/ 140");
    expect(formatSignedSoles(-300)).toBe("−S/ 300");
    expect(formatSignedSoles(0.2)).toBe("S/ 0");
    expect(formatBytes(37502)).toBe("37 KB");
    expect(formatBytes(4.8 * 1024 * 1024)).toBe("4.8 MB");
  });
});

