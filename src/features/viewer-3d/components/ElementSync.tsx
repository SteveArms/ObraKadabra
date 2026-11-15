"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type { ViewerMaterials } from "../hooks/useViewerMaterials";
import { applyAppearance, buildingMaterialFor, materialStateFor, type ElementEntry } from "../scene";
import { isEntryVisible, statusOf, useViewerStore } from "../store";

// Applies visibility, color and selection to every registered element, whatever model it came from
export function ElementSync({ materials }: { materials: ViewerMaterials }) {
  const invalidate = useThree((state) => state.invalidate);
  const { entries, levelCut, selectedKey, statuses, timeline, colorMode } = useViewerStore(
    useShallow(({ entries, levelCut, selectedKey, statuses, timeline, colorMode }) => ({ entries, levelCut, selectedKey, statuses, timeline, colorMode })),
  );

  useEffect(() => {
    const materialFor = (entry: ElementEntry) => {
      if (entry.key === selectedKey) return materials.selected;
      const status = statusOf(statuses, entry.key);
      if (colorMode === "status") return materials.byStatus[status];
      return materials.building(buildingMaterialFor(entry.type, Boolean(timeline?.plastered[entry.key])), materialStateFor(status));
    };
    applyAppearance(entries, { isVisible: (entry) => isEntryVisible(entry, { levelCut, statuses, timeline }), selectedKey, materialFor });
    invalidate();
  }, [entries, levelCut, selectedKey, statuses, timeline, colorMode, materials, invalidate]);

  return null;
}
