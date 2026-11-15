import { DEMO_ENTRIES } from "@/data/demos";
import { FloorPlanSchema } from "@/schemas/floor-plan";
import type { Project } from "@/schemas/project";

// Demos are fixed content, so they carry a constant timestamp instead of the current date
const DEMO_TIMESTAMP = "2026-11-08T00:00:00.000Z";

export type DemoProject = Project & { category: string; highlights: string[] };

export const DEMO_PROJECTS: DemoProject[] = DEMO_ENTRIES.map((entry) => ({
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

export function isDemoId(id: string): boolean {
  return DEMO_PROJECTS.some((demo) => demo.id === id);
}

export function getDemoProject(id: string): DemoProject | undefined {
  return DEMO_PROJECTS.find((demo) => demo.id === id);
}
