import { z } from "zod";
import { ProgressEntrySchema, type ProgressEntry } from "@/schemas/progress";
import { ProjectSchema, type Project } from "@/schemas/project";

// Postgres answers timestamps as "+00:00"; the schemas expect the "Z" form the app writes
function toIso(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

const optional = (value: string | null | undefined) => value ?? undefined;

const ProjectRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullish(),
  start_date: z.string().nullish(),
  status: z.string().nullish(),
  floor_plan: z.unknown(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ProgressRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  week: z.number(),
  level_label: z.string(),
  sector: z.string().nullish(),
  recorded_at: z.string(),
  approved: z.boolean(),
  has_photo: z.boolean(),
  findings: z.unknown(),
});

export const PROJECT_COLUMNS = "id, name, location, start_date, status, floor_plan, created_at, updated_at";
export const PROGRESS_COLUMNS = "id, project_id, week, level_label, sector, recorded_at, approved, has_photo, findings";

export function projectToRow(project: Project) {
  return {
    id: project.id,
    name: project.name,
    location: project.location ?? null,
    start_date: project.startDate ?? null,
    status: project.status ?? null,
    floor_plan: project.floorPlan,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

// Rows that no longer match the schema are skipped instead of breaking the whole list
export function rowToProject(row: unknown): Project | undefined {
  const parsed = ProjectRowSchema.safeParse(row);
  if (!parsed.success) return undefined;
  const { id, name, location, start_date, status, floor_plan, created_at, updated_at } = parsed.data;
  const project = { id, name, location: optional(location), startDate: optional(start_date), status: optional(status), floorPlan: floor_plan, createdAt: toIso(created_at), updatedAt: toIso(updated_at) };
  const valid = ProjectSchema.safeParse(project);
  return valid.success ? valid.data : undefined;
}

export function progressToRow(entry: ProgressEntry) {
  return {
    id: entry.id,
    project_id: entry.projectId,
    week: entry.week,
    level_label: entry.levelLabel,
    sector: entry.sector ?? null,
    recorded_at: entry.recordedAt,
    approved: entry.approved,
    has_photo: entry.hasPhoto,
    findings: entry.findings,
  };
}

export function rowToProgress(row: unknown): ProgressEntry | undefined {
  const parsed = ProgressRowSchema.safeParse(row);
  if (!parsed.success) return undefined;
  const { id, project_id, week, level_label, sector, recorded_at, approved, has_photo, findings } = parsed.data;
  const entry = { id, projectId: project_id, week, levelLabel: level_label, sector: optional(sector), recordedAt: toIso(recorded_at), approved, hasPhoto: has_photo, findings };
  const valid = ProgressEntrySchema.safeParse(entry);
  return valid.success ? valid.data : undefined;
}

export function rowsTo<T>(rows: unknown[] | null, map: (row: unknown) => T | undefined): T[] {
  return (rows ?? []).flatMap((row) => {
    const item = map(row);
    return item ? [item] : [];
  });
}
