import { existsSync } from "node:fs";
import { join } from "node:path";
import { isDemoId } from "./demos";

// Server only: the demo uses its GLB when the file is present and falls back to the procedural model otherwise
export function getDemoModelUrl(id: string): string | undefined {
  if (!isDemoId(id)) return undefined;
  const file = join(process.cwd(), "public", "models", "demos", `${id}.glb`);
  return existsSync(file) ? `/models/demos/${id}.glb` : undefined;
}
