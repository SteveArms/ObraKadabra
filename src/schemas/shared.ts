import { z } from "zod";
import { ProgressEntrySchema } from "./progress";
import { ProjectSchema } from "./project";

// What a share link shows: the project, its approved logs (newest first) and, when available, a signed URL of the latest approved photo
export const SharedProjectSchema = z.object({
  project: ProjectSchema,
  progress: z.array(ProgressEntrySchema),
  photoUrl: z.url().optional(),
});

export type SharedProject = z.infer<typeof SharedProjectSchema>;
