// Element ids follow the Peruvian drawing habit: M-1 on the first floor, M-201 for the first wall of floor 2
export function elementId(prefix: string, level: number, index: number): string {
  return `${prefix}-${level > 1 ? level * 100 + index + 1 : index + 1}`;
}

export const ID_PREFIX = { wall: "M", door: "P", window: "V", column: "C", room: "R", footing: "Z", slab: "L", roof: "T" } as const;
