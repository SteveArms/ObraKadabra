import type { Stage } from "@/schemas/schedule";

// Where the photo was taken: a floor (its walls, columns and the slab above) or the roof
export type LevelChoice = { id: string; label: string; level: number; stages: Stage[] };

export type SitePhoto = { blob: Blob; url: string; name: string; size: number; takenAt: string };

export type AnalysisState = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "done" };
