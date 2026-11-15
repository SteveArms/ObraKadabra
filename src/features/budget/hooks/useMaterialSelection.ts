"use client";

import { useState } from "react";

// Every material starts selected; unchecking is remembered per week so moving the slider never loses it
export function useMaterialSelection(week: number) {
  const [unchecked, setUnchecked] = useState<Record<string, boolean>>({});
  const key = (material: string) => `${week}:${material}`;
  return {
    isChosen: (material: string) => !unchecked[key(material)],
    toggle: (material: string) => setUnchecked((current) => ({ ...current, [key(material)]: !current[key(material)] })),
  };
}
