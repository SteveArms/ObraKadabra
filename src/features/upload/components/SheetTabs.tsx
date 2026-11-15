"use client";

import { ToggleButton } from "@/components/ui/ToggleButton";
import { useUploadStore } from "../store";

// Floor switcher shown once there is more than one plan; the order of the sheets is the floor number
export function SheetTabs({ statusFor }: { statusFor?: (sheetId: string) => string | null }) {
  const sheets = useUploadStore((state) => state.sheets);
  const activeId = useUploadStore((state) => state.activeId);
  const setActive = useUploadStore((state) => state.setActive);
  if (sheets.length < 2) return null;
  return (
    <div role="group" aria-label="Floor plans" className="flex flex-wrap gap-1 rounded-md bg-surface-container-high p-1 self-start">
      {sheets.map((sheet, index) => {
        const status = statusFor?.(sheet.id);
        return (
          <ToggleButton key={sheet.id} pressed={sheet.id === activeId} onClick={() => setActive(sheet.id)} className="min-h-9 px-space-sm">
            Floor {index + 1}
            {status ? <span className="text-body-sm opacity-80">· {status}</span> : null}
          </ToggleButton>
        );
      })}
    </div>
  );
}
