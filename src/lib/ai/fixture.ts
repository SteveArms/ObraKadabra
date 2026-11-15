import { readFile } from "node:fs/promises";
import path from "node:path";
import type { VisionModel } from "./model";

const FIXTURE_DIR = path.join(process.cwd(), "e2e", "fixtures");

// Demo mode: plano-<name>.png answers with plano-<name>.json, any other file with plano-simple.json
export function fixtureName(fileName: string): string {
  const match = /^plano-([a-z0-9-]+)\./i.exec(path.basename(fileName));
  return `plano-${match?.[1]?.toLowerCase() ?? "simple"}.json`;
}

export function fixtureModel(fileName: string): VisionModel {
  return async () => {
    try {
      return await readFile(path.join(FIXTURE_DIR, fixtureName(fileName)), "utf8");
    } catch {
      return readFile(path.join(FIXTURE_DIR, "plano-simple.json"), "utf8");
    }
  };
}
