// Typical sections for 1–2 floor confined masonry homes, in meters
export const STRIP_FOOTING = { width: 0.4, depth: 0.8 } as const;
export const CONFINING_BEAM = { width: 0.25, height: 0.2 } as const;

// Lightweight joist slab (losa aligerada) h = 0.20 m: concrete per m² of slab
export const SLAB_CONCRETE_M3_PER_M2 = 0.0875;

// Rebar ratios in kg per m³ of concrete, and per m² for slabs
export const REBAR_KG_PER_M3 = { footing: 40, column: 120, beam: 100 } as const;
export const SLAB_REBAR_KG_PER_M2 = 3.5;

// Depth of the foundation bottom below natural ground level (Df), in meters
export const FOUNDATION_DEPTH = 1;
