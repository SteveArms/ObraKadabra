import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { useEditorStore } from "../store";
import { toolHint } from "../tools";

type CanvasHintProps = { notice: string | null; missingPhoto: boolean; readOnly: boolean };

// One polite status line: what the current tool does, or why the last click did nothing
export function CanvasHint({ notice, missingPhoto, readOnly }: CanvasHintProps) {
  const tool = useEditorStore((state) => state.tool);
  const notes = [readOnly ? "Demo projects are read-only, so your changes here are not saved." : null, missingPhoto ? "No photo is saved for this floor, so only the drawing is shown." : null];
  return (
    <div className="flex max-w-md min-w-0 flex-col gap-1">
      {notes.map((note) =>
        note ? (
          <p key={note} className={cn(GLASS_SURFACE, "flex items-center gap-1.5 px-space-sm py-1 text-body-sm text-on-surface-variant")}>
            <Icon name="info" size={16} />
            {note}
          </p>
        ) : null,
      )}
      <p role="status" data-testid="canvas-hint" className={cn(GLASS_SURFACE, "px-space-sm py-1 text-body-sm text-pretty", notice ? "font-semibold text-secondary" : "text-on-surface-variant")}>
        {notice ?? toolHint(tool)}
      </p>
    </div>
  );
}
