import { z } from "zod";
import { FloorPlanSchema } from "./floor-plan";

// Draft: the plan came from the AI and still needs review in the editor; missing means ready
export const ProjectStatusSchema = z.enum(["draft", "ready"]);

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
  startDate: z.iso.date().optional(),
  status: ProjectStatusSchema.optional(),
  floorPlan: FloorPlanSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;
