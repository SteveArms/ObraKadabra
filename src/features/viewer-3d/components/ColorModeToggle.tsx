"use client";

import { Icon } from "@/components/ui/Icon";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { useViewerStore } from "../store";

// Building materials by default; pressed, the model switches to the schedule's status colors
export function ColorModeToggle() {
  const colorMode = useViewerStore((state) => state.colorMode);
  const setColorMode = useViewerStore((state) => state.setColorMode);
  return (
    <ToggleButton
      pressed={colorMode === "status"}
      onClick={() => setColorMode(colorMode === "status" ? "material" : "status")}
      data-testid="color-mode-toggle"
    >
      <Icon name="palette" size={18} />
      <span className="max-sm:sr-only">Status colors</span>
    </ToggleButton>
  );
}
