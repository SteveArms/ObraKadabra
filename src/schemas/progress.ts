import { z } from "zod";
import { ElementStatusSchema } from "./schedule";
import { StageSchema } from "./stage";
import { ElementTypeSchema } from "./takeoff";

// Elements a site photo can show, named like the 3D meshes (column_C-1) so findings map straight onto the model
export const ProgressElementTypeSchema = ElementTypeSchema.extract(["footing", "wall", "column", "slab", "roof"]);

// What a photo can say about an element; "delayed" is not seen in a photo, it comes from comparing with the plan
export const ReportedStatusSchema = ElementStatusSchema.extract(["done", "in_progress", "not_started"]);

export const ExpectedElementSchema = z.object({ id: z.string().min(1), type: ProgressElementTypeSchema, stage: StageSchema });

export const ProgressContextSchema = z.object({
  week: z.number().int().min(1),
  levelLabel: z.string().min(1),
  sector: z.string().optional(),
  expected: z.array(ExpectedElementSchema).min(1).max(60),
});

export const ProgressFindingSchema = z.object({
  elementId: z.string().min(1),
  type: ProgressElementTypeSchema,
  status: ReportedStatusSchema,
  percent: z.number().min(0).max(100),
  evidence: z.string(),
  confidence: z.number().min(0).max(1),
});

// The vision model's answer, also the /api/avance response body
export const ProgressAnalysisSchema = z.object({ findings: z.array(ProgressFindingSchema) });

// One photo log: proposed by the AI, approved by the foreman; only approved entries move the actual progress
export const ProgressEntrySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  week: z.number().int().min(1),
  levelLabel: z.string().min(1),
  sector: z.string().optional(),
  recordedAt: z.iso.datetime(),
  approved: z.boolean(),
  hasPhoto: z.boolean(),
  findings: z.array(ProgressFindingSchema),
});

export type ProgressElementType = z.infer<typeof ProgressElementTypeSchema>;
export type ReportedStatus = z.infer<typeof ReportedStatusSchema>;
export type ExpectedElement = z.infer<typeof ExpectedElementSchema>;
export type ProgressContext = z.infer<typeof ProgressContextSchema>;
export type ProgressFinding = z.infer<typeof ProgressFindingSchema>;
export type ProgressAnalysis = z.infer<typeof ProgressAnalysisSchema>;
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;
