import { describe, expect, it } from "vitest";
import { makeTestPlan } from "@/lib/takeoff/test-plan";
import { findMissingMeshRefs, parseMeshName, readGlbObjectNames } from "./index";

function makeGlb(json: object): Uint8Array {
  const text = new TextEncoder().encode(JSON.stringify(json));
  const padded = new Uint8Array(Math.ceil(text.length / 4) * 4).fill(0x20);
  padded.set(text);
  const bytes = new Uint8Array(20 + padded.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.length, true);
  view.setUint32(12, padded.length, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(padded, 20);
  return bytes;
}

describe("readGlbObjectNames", () => {
  it("reads unique node and mesh names", () => {
    const glb = makeGlb({ nodes: [{ name: "wall_M-1" }, { name: "Camera" }], meshes: [{ name: "wall_M-1" }, {}] });
    expect(readGlbObjectNames(glb)).toEqual(["wall_M-1", "Camera"]);
  });

  it("rejects files that are not GLB", () => {
    expect(() => readGlbObjectNames(new Uint8Array(24))).toThrow("Not a GLB file");
  });
});

describe("parseMeshName and findMissingMeshRefs", () => {
  it("parses typed names and ignores the rest", () => {
    expect(parseMeshName("column_C-2")).toEqual({ type: "column", id: "C-2" });
    expect(parseMeshName("wall_M-14.001")).toEqual({ type: "wall", id: "M-14" });
    expect(parseMeshName("Light")).toBeNull();
    expect(parseMeshName("chair_S-1")).toBeNull();
  });

  it("reports meshes whose id is not in the plan", () => {
    const names = ["wall_M-1", "column_C-1", "footing_Z-1", "roof_T1", "door_P-1", "wall_M-9", "window_V-1"];
    expect(findMissingMeshRefs(names, makeTestPlan())).toEqual([
      { type: "wall", id: "M-9" },
      { type: "window", id: "V-1" },
    ]);
  });
});
