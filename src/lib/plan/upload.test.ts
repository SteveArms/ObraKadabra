import { describe, expect, it } from "vitest";
import { PLAN_UPLOAD_MAX_BYTES, planFileError } from "./upload";

describe("planFileError", () => {
  it("accepts JPG, PNG and PDF up to 25 MB", () => {
    expect(planFileError({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(planFileError({ type: "application/pdf", size: PLAN_UPLOAD_MAX_BYTES })).toBeNull();
  });

  it("rejects other types, empty files and files over 25 MB", () => {
    expect(planFileError({ type: "image/heic", size: 1000 })).toMatch(/JPG, PNG or PDF/);
    expect(planFileError({ type: "image/png", size: 0 })).toMatch(/empty/);
    expect(planFileError({ type: "image/png", size: PLAN_UPLOAD_MAX_BYTES + 1 })).toMatch(/25 MB/);
  });
});
