import { z } from "zod";

// Confined masonry order (AGENTS.md §8): walls go up first, columns are poured against them, then beams and slab
export const STAGES = ["foundation", "walls", "columns", "beams_slab", "roof", "finishes"] as const;

export const StageSchema = z.enum(STAGES);

export type Stage = z.infer<typeof StageSchema>;
