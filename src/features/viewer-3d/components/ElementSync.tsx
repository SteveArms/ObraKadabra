"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { StatusMaterials } from "../hooks/useStatusMaterials";
import { applyAppearance } from "../scene";
import { isEntryVisible, statusOf, useViewerStore } from "../store";

// Applies visibility, status color and selection to every registered element, whatever model it came from
export function ElementSync({ materials }: { materials: StatusMaterials }) {
  const invalidate = useThree((state) => state.invalidate);
  const entries = useViewerStore((state) => state.entries);
  const levelCut = useViewerStore((state) => state.levelCut);
  const selectedKey = useViewerStore((state) => state.selectedKey);
  const statuses = useViewerStore((state) => state.statuses);
  const timeline = useViewerStore((state) => state.timeline);

  useEffect(() => {
    applyAppearance(entries, {
      isVisible: (entry) => isEntryVisible(entry, { levelCut, statuses, timeline }),
      selectedKey,
      materialFor: (entry) => (entry.key === selectedKey ? materials.selected : materials.byStatus[statusOf(statuses, entry.key)]),
    });
    invalidate();
  }, [entries, levelCut, selectedKey, statuses, timeline, materials, invalidate]);

  return null;
}
