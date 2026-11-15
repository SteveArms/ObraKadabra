import { z } from "zod";
import { FloorPlanSchema } from "./floor-plan";

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
  floorPlan: FloorPlanSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;
