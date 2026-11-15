import { readFile } from "node:fs/promises";
import path from "node:path";
import type { VisionModel } from "./model";

const FIXTURE_DIR = path.join(process.cwd(), "e2e", "fixtures");

export type FixtureKind = "plan" | "progress";

// Uploads named like the fixture photos pick their answer; any other file gets the default one
const FIXTURES: Record<FixtureKind, { upload: string; answer: string; fallback: string }> = {
  plan: { upload: "plano", answer: "plano", fallback: "simple" },
  progress: { upload: "obra", answer: "avance", fallback: "columnas" },
};

// Demo mode: plano-<name>.png answers with plano-<name>.json, obra-<name>.jpg with avance-<name>.json
export function fixtureName(fileName: string, kind: FixtureKind = "plan"): string {
  const { upload, answer, fallback } = FIXTURES[kind];
  const match = new RegExp(`^${upload}-([a-z0-9-]+)\\.`, "i").exec(path.basename(fileName));
  return `${answer}-${match?.[1]?.toLowerCase() ?? fallback}.json`;
}

export function fixtureModel(fileName: string, kind: FixtureKind = "plan"): VisionModel {
  const { answer, fallback } = FIXTURES[kind];
  return async () => {
    try {
      return await readFile(path.join(FIXTURE_DIR, fixtureName(fileName, kind)), "utf8");
    } catch {
      return readFile(path.join(FIXTURE_DIR, `${answer}-${fallback}.json`), "utf8");
    }
  };
}
