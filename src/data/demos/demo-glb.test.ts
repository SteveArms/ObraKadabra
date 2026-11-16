import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findMissingMeshRefs, readGlbObjectNames } from "@/lib/gltf";
import { demoProjects } from "@/lib/projects";

const GLB_DIR = join(process.cwd(), "public", "models", "demos");

// The GLBs are added by hand, so a missing file skips with a note instead of failing
describe.each(demoProjects())("GLB for demo $id", (demo) => {
  const path = join(GLB_DIR, `${demo.id}.glb`);

  it("names every mesh <type>_<id> with an id from its FloorPlan", (context) => {
    if (!existsSync(path)) context.skip(`GLB not found yet: public/models/demos/${demo.id}.glb`);
    const names = readGlbObjectNames(new Uint8Array(readFileSync(path)));
    expect(findMissingMeshRefs(names, demo.floorPlan)).toEqual([]);
  });
});
