// Element ids follow the Peruvian drawing habit: M-1 on the first floor, M-201 for the first wall of floor 2
export function elementId(prefix: string, level: number, index: number): string {
  return `${prefix}-${level > 1 ? level * 100 + index + 1 : index + 1}`;
}

export const ID_PREFIX = { wall: "M", door: "P", window: "V", column: "C", room: "R", footing: "Z", slab: "L", roof: "T" } as const;

type IdPrefix = (typeof ID_PREFIX)[keyof typeof ID_PREFIX];

// Next free id on a floor for elements drawn in the editor, after the highest one already used (M-7 after M-6)
export function nextElementId(ids: string[], prefix: IdPrefix, level: number): string {
  const base = level > 1 ? level * 100 : 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const used = ids.flatMap((id) => {
    const number = Number(pattern.exec(id)?.[1]);
    return number > base && number <= base + 99 ? [number - base - 1] : [];
  });
  return elementId(prefix, level, used.length ? Math.max(...used) + 1 : 0);
}
