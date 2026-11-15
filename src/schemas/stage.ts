import { z } from "zod";

export const STAGES = ["foundation", "columns", "beams_slab", "walls", "roof", "finishes"] as const;

export const StageSchema = z.enum(STAGES);

export type Stage = z.infer<typeof StageSchema>;
