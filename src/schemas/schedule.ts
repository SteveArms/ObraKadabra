import { z } from "zod";
import { ElementTypeSchema, TakeoffLineSchema } from "./takeoff";
import { StageSchema } from "./stage";

export { STAGES, StageSchema, type Stage } from "./stage";

export const ElementStatusSchema = z.enum(["not_started", "in_progress", "done", "delayed"]);

const span = {
  startDay: z.number().min(0),
  endDay: z.number().min(0),
  startWeek: z.number().int().min(1),
  endWeek: z.number().int().min(1),
  cost: z.number().min(0),
};

export const ScheduledTaskSchema = z.object({
  key: z.string(),
  stage: StageSchema,
  level: z.number().int().min(0),
  elementType: ElementTypeSchema,
  elementId: z.string(),
  meshKey: z.string().optional(),
  lines: z.array(TakeoffLineSchema),
  ...span,
});

export const ActivitySchema = z.object({ stage: StageSchema, level: z.number().int().min(0), ...span });

export const ScheduleSchema = z.object({
  tasks: z.array(ScheduledTaskSchema),
  activities: z.array(ActivitySchema),
  totalDays: z.number().min(0),
  totalWeeks: z.number().int().min(0),
  totalCost: z.number().min(0),
});

// Actual percent complete per mesh key, as reported up to a given week (built from ProgressEntry in phase 6)
export const ActualProgressSchema = z.object({
  week: z.number().int().min(1),
  percents: z.record(z.string(), z.number().min(0).max(100)),
});

export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type ActualProgress = z.infer<typeof ActualProgressSchema>;
export type ElementStatus = z.infer<typeof ElementStatusSchema>;
