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

// Isolated footing poured under every ground-floor column
export const ISOLATED_FOOTING = { w: 1, d: 1, depth: 0.6 } as const;

// Slab and roof thickness: lightweight joist slab vs. metal sheet on purlins
export const SLAB_THICKNESS = 0.2;
export const ROOF_THICKNESS = { concrete_slab: 0.2, metal_sheet: 0.05 } as const;

// Brick walls are laid as soga (0.15 m) or cabeza (0.25 m); measured thicknesses snap to the closest one
export const WALL_THICKNESSES = [0.15, 0.25] as const;

// Load-bearing walls are usually laid in cabeza and partitions in soga
export const WALL_THICKNESS_BY_KIND = { load_bearing: 0.25, partition: 0.15 } as const;

// Plans rarely show heights, so detected openings start with standard sizes the user can edit
export const DEFAULT_OPENING = {
  door: { height: 2.1, sill: 0 },
  window: { height: 1.2, sill: 0.9 },
} as const;

// Openings and columns drawn by hand in the editor start at the usual sizes of a self-built home
export const DEFAULT_OPENING_WIDTH = { door: 0.9, window: 1.2 } as const;
export const DEFAULT_COLUMN = { w: 0.25, d: 0.25 } as const;

// Lowest floor-to-floor height the wizard accepts: a 2.30 m clear room height (the usual minimum for homes) plus a thin slab
export const MIN_FLOOR_HEIGHT = 2.4;
