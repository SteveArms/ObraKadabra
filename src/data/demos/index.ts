import casa1Piso90 from "./casa-1-piso-90.json";
import vivienda2Pisos120 from "./vivienda-2-pisos-120.json";

export type DemoEntry = {
  id: string;
  name: string;
  category: string;
  location: string;
  startDate: string;
  highlights: string[];
  floorPlan: unknown;
};

export const DEMO_ENTRIES: DemoEntry[] = [
  {
    id: "casa-1-piso-90",
    name: "1-floor house · 90 m²",
    category: "Typical urban lot",
    location: "Lima, 9 × 10 m lot",
    startDate: "2026-10-05",
    highlights: ["Isolated and strip footings", "Load-bearing brick walls", "Joist slab roof, 20 cm"],
    floorPlan: casa1Piso90,
  },
  {
    id: "vivienda-2-pisos-120",
    name: "2-floor home · 120 m²",
    category: "Progressive build",
    location: "Lima, 6 × 10 m lot",
    startDate: "2026-10-05",
    highlights: ["Two confined masonry floors", "Joist slab between floors", "Three bedrooms upstairs"],
    floorPlan: vivienda2Pisos120,
  },
];
