import { z } from "zod";

// Coordinates are plan units (source image pixels) converted with meta.scale; every other dimension is in meters
export const PointSchema = z.object({ x: z.number(), y: z.number() });

const id = z.string().min(1);
const level = z.number().int().min(1);
const meters = z.number().positive();
const polygon = z.array(PointSchema).min(3);
// AI certainty for a detected element; anything hand-drawn or confirmed is 1
const confidence = z.number().min(0).max(1);

export const RoofTypeSchema = z.enum(["concrete_slab", "metal_sheet"]);

export const FloorPlanMetaSchema = z.object({
  name: z.string().min(1),
  scale: meters,
  levels: level,
  floorHeight: meters,
  roofType: RoofTypeSchema,
});

export const WallKindSchema = z.enum(["load_bearing", "partition"]);

export const WallSchema = z.object({
  id,
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  thickness: meters,
  kind: WallKindSchema,
  level,
  confidence,
});

export const OpeningSchema = z.object({
  id,
  wallId: id,
  kind: z.enum(["door", "window"]),
  offset: z.number().min(0),
  width: meters,
  height: meters,
  sill: z.number().min(0),
  confidence: confidence.optional(),
});

export const ColumnSchema = z.object({ id, x: z.number(), y: z.number(), w: meters, d: meters, level, confidence: confidence.optional() });

export const FootingSchema = z.object({ id, x: z.number(), y: z.number(), w: meters, d: meters, depth: meters });

export const SlabSchema = z.object({ id, level, polygon, thickness: meters });

export const RoofSchema = z.object({ id, level, polygon, thickness: meters });

export const RoomSchema = z.object({ id, name: z.string().min(1), polygon, level, confidence: confidence.optional() });

export const FloorPlanSchema = z.object({
  meta: FloorPlanMetaSchema,
  walls: z.array(WallSchema),
  openings: z.array(OpeningSchema),
  columns: z.array(ColumnSchema),
  footings: z.array(FootingSchema),
  slabs: z.array(SlabSchema),
  roofs: z.array(RoofSchema),
  rooms: z.array(RoomSchema),
});

export type Point = z.infer<typeof PointSchema>;
export type RoofType = z.infer<typeof RoofTypeSchema>;
export type FloorPlanMeta = z.infer<typeof FloorPlanMetaSchema>;
export type WallKind = z.infer<typeof WallKindSchema>;
export type Wall = z.infer<typeof WallSchema>;
export type Opening = z.infer<typeof OpeningSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Footing = z.infer<typeof FootingSchema>;
export type Slab = z.infer<typeof SlabSchema>;
export type Roof = z.infer<typeof RoofSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type FloorPlan = z.infer<typeof FloorPlanSchema>;
