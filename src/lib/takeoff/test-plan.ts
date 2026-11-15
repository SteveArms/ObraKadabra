import type { FloorPlan } from "@/schemas/floor-plan";

const square = (size: number) => [
  { x: 0, y: 0 },
  { x: size, y: 0 },
  { x: size, y: size },
  { x: 0, y: size },
];

// One 4 × 4 m room with a single load-bearing wall, one door, one column and one footing
export function makeTestPlan(overrides: Partial<FloorPlan["meta"]> = {}): FloorPlan {
  return {
    meta: { name: "Test", scale: 1, levels: 1, floorHeight: 2.6, roofType: "concrete_slab", ...overrides },
    walls: [{ id: "M-1", x1: 0, y1: 0, x2: 4, y2: 0, thickness: 0.15, kind: "load_bearing", level: 1, confidence: 1 }],
    openings: [{ id: "P-1", wallId: "M-1", kind: "door", offset: 1, width: 1, height: 2.1, sill: 0 }],
    columns: [{ id: "C-1", x: 0, y: 0, w: 0.25, d: 0.25, level: 1 }],
    footings: [{ id: "Z-1", x: 0, y: 0, w: 1, d: 1, depth: 0.6 }],
    slabs: [],
    roofs: [{ id: "T1", level: 1, polygon: square(4), thickness: 0.2 }],
    rooms: [{ id: "R-1", name: "Room", polygon: square(4), level: 1 }],
  };
}
