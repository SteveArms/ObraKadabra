import { describe, expect, it } from "vitest";
import { formatArea, formatCount, formatPercent, formatSoles } from "./format";

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
});
