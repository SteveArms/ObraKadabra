import { z } from "zod";

export const STAGES = ["foundation", "columns", "beams_slab", "walls", "roof", "finishes"] as const;

export const StageSchema = z.enum(STAGES);

export const ElementStatusSchema = z.enum(["not_started", "in_progress", "done", "delayed"]);

export const ProgressEntrySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  stage: StageSchema,
  elementIds: z.array(z.string().min(1)),
  percent: z.number().min(0).max(100),
  status: ElementStatusSchema,
  recordedAt: z.iso.datetime(),
  photoUrl: z.string().optional(),
  note: z.string().optional(),
});

export type Stage = z.infer<typeof StageSchema>;
export type ElementStatus = z.infer<typeof ElementStatusSchema>;
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;
