import type { Point, RoofType } from "@/schemas/floor-plan";

export type Raster = { blob: Blob; url: string; width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Rotation = 0 | 90 | 180 | 270;
export type Edits = { rotation: Rotation; contrast: boolean; crop: Rect | null };

// One uploaded plan sheet; its position in the list is its floor (first sheet = floor 1)
export type Sheet = {
  id: string;
  fileName: string;
  source: Raster;
  edits: Edits;
  image: Raster;
  calibration: { points: Point[]; meters: string };
};

export type LevelOption = 1 | 2 | 3;

export type WizardDetails = { name: string; levels: LevelOption; floorHeight: string; roofType: RoofType };

export type WizardStep = 0 | 1 | 2;
