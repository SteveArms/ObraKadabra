import { DEMO_ENTRIES } from "@/data/demos";
import { FloorPlanSchema } from "@/schemas/floor-plan";
import type { Project } from "@/schemas/project";
import type { SharedProject } from "@/schemas/shared";

// Demos are fixed content, so they carry a constant timestamp instead of the current date
const DEMO_TIMESTAMP = "2026-11-08T00:00:00.000Z";

export type DemoProject = Project & { category: string; highlights: string[] };

let parsed: DemoProject[] | undefined;

const parseDemos = (): DemoProject[] => DEMO_ENTRIES.map((entry) => ({
  id: entry.id,
  name: entry.name,
  location: entry.location,
  startDate: entry.startDate,
  category: entry.category,
  highlights: entry.highlights,
  floorPlan: FloorPlanSchema.parse(entry.floorPlan),
  createdAt: DEMO_TIMESTAMP,
  updatedAt: DEMO_TIMESTAMP,
}));

// Parsed with Zod on first use, not when a page imports this module, so pages that never open a demo skip the work
export function demoProjects(): DemoProject[] {
  parsed ??= parseDemos();
  return parsed;
}

const DEMO_IDS = new Set(DEMO_ENTRIES.map((entry) => entry.id));

export function isDemoId(id: string): boolean {
  return DEMO_IDS.has(id);
}

export function getDemoProject(id: string): DemoProject | undefined {
  return isDemoId(id) ? demoProjects().find((demo) => demo.id === id) : undefined;
}

// Demos are public: their share link needs no token and no session
export function getSharedDemo(token: string): SharedProject | undefined {
  const project = getDemoProject(token);
  return project ? { project, progress: [] } : undefined;
}
