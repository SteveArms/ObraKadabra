import { z } from "zod";
import { StageSchema } from "./schedule";

export const ElementTypeSchema = z.enum(["footing", "wall", "column", "beam", "slab", "roof", "room"]);

export const TakeoffItemSchema = z.enum([
  "structural_concrete",
  "cyclopean_concrete",
  "rebar",
  "masonry_load_bearing",
  "masonry_partition",
  "plaster",
  "floor_screed",
  "light_roofing",
]);

export const MaterialSchema = z.enum(["cement", "sand", "gravel", "brick", "rebar"]);

export const UnitSchema = z.enum(["m3", "m2", "kg", "bag", "unit"]);

export const TakeoffLineSchema = z.object({
  elementId: z.string(),
  elementType: ElementTypeSchema,
  stage: StageSchema,
  item: TakeoffItemSchema,
  unit: UnitSchema,
  quantity: z.number().min(0),
});

export const MaterialQuantitySchema = z.object({
  material: MaterialSchema,
  unit: UnitSchema,
  quantity: z.number().min(0),
});

export type ElementType = z.infer<typeof ElementTypeSchema>;
export type TakeoffItem = z.infer<typeof TakeoffItemSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type TakeoffLine = z.infer<typeof TakeoffLineSchema>;
export type MaterialQuantity = z.infer<typeof MaterialQuantitySchema>;
