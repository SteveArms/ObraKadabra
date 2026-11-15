"use client";

import { Icon } from "@/components/ui/Icon";
import { GLASS_SURFACE } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { useEditorStore } from "../store";
import { TOOL_GROUPS } from "../tools";

// Icon-only buttons name the tool for screen readers and show the name and key in a tooltip on hover or focus
export function ToolRail() {
  const tool = useEditorStore((state) => state.tool);
  const setTool = useEditorStore((state) => state.setTool);
  return (
    <div role="toolbar" aria-label="Drawing tools" aria-orientation="vertical" className={cn(GLASS_SURFACE, "flex flex-col gap-1 p-1")}>
      {TOOL_GROUPS.map((group, index) => (
        <div key={group[0].id} className={cn("flex flex-col gap-1", index > 0 && "border-t border-line pt-1")}>
          {group.map((item) => {
            const active = item.id === tool;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                aria-keyshortcuts={item.key === "delete" ? "Delete" : item.keyLabel}
                data-testid={`tool-${item.id}`}
                onClick={() => setTool(item.id)}
                className={cn(
                  "group relative flex size-10 items-center justify-center rounded-md transition-[background-color,color] duration-150",
                  active ? "bg-primary-container text-on-primary" : item.id === "delete" ? "text-on-surface-variant hover:bg-error-container hover:text-error" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                <Icon name={item.icon} />
                <span className="pointer-events-none absolute start-full z-10 ms-2 flex items-center gap-space-xs rounded-sm bg-inverse-surface px-space-xs py-1 text-body-sm whitespace-nowrap text-inverse-on-surface opacity-0 transition-[opacity] duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.label}
                  <kbd className="font-mono text-label-numeric-sm text-inverse-primary">{item.keyLabel}</kbd>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
