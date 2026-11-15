import { z } from "zod";
import { ColumnSchema, OpeningSchema, PointSchema, RoomSchema, WallSchema } from "./floor-plan";

const confidence = z.number().min(0).max(1);
const pixels = z.number().positive();

// What the vision model returns: every coordinate and length in pixels of the uploaded image
export const ExtractedPlanSchema = z.object({
  walls: z.array(WallSchema.omit({ level: true }).extend({ thickness: pixels })),
  openings: z.array(OpeningSchema.pick({ id: true, wallId: true, kind: true }).extend({ offset: z.number().min(0), width: pixels, confidence })),
  columns: z.array(ColumnSchema.omit({ level: true, confidence: true }).extend({ w: pixels, d: pixels, confidence })),
  rooms: z.array(RoomSchema.omit({ level: true, confidence: true }).extend({ name: z.string(), confidence })),
  dimensions: z.array(z.object({ text: z.string(), meters: z.number().positive(), from: PointSchema, to: PointSchema })),
});

// One floor after conversion: coordinates stay in image pixels (meta.scale converts them), sizes are in meters
export const LevelPlanSchema = z.object({
  level: z.number().int().min(1),
  scale: z.number().positive(),
  walls: z.array(WallSchema),
  openings: z.array(OpeningSchema),
  columns: z.array(ColumnSchema),
  rooms: z.array(RoomSchema),
});

export const PendingElementSchema = z.object({
  type: z.enum(["wall", "opening", "column", "room"]),
  id: z.string().min(1),
  confidence,
});

export const PROCESSING_STEPS = ["reading", "walls", "openings", "rooms", "volumetry"] as const;
export const ProcessingStepSchema = z.enum(PROCESSING_STEPS);

// The /api/plano response is newline-delimited JSON: a "step" event as each stage finishes, then "result" or "error"
export const PlanStreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("step"), step: ProcessingStepSchema, counts: z.record(z.string(), z.number()).optional(), names: z.array(z.string()).optional() }),
  z.object({ type: z.literal("result"), plan: LevelPlanSchema, pending: z.array(PendingElementSchema) }),
  z.object({ type: z.literal("error"), message: z.string().min(1) }),
]);

export type ExtractedPlan = z.infer<typeof ExtractedPlanSchema>;
export type LevelPlan = z.infer<typeof LevelPlanSchema>;
export type PendingElement = z.infer<typeof PendingElementSchema>;
export type ProcessingStep = z.infer<typeof ProcessingStepSchema>;
export type PlanStreamEvent = z.infer<typeof PlanStreamEventSchema>;
