import { z } from "zod";

export const StageStatusSchema = z.enum(["not_started", "in_progress", "done", "delayed"]);

export type StageStatus = z.infer<typeof StageStatusSchema>;
