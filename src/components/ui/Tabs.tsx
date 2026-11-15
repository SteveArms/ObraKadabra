"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProps = {
  items: TabItem[];
  label: string;
  defaultTabId?: string;
};

const KEY_OFFSETS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export function Tabs({ items, label, defaultTabId }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    const next = (index + items.length) % items.length;
    setActiveId(items[next].id);
    tabRefs.current[next]?.focus();
  }

  function getTargetIndex(key: string, index: number): number | undefined {
    if (key === "Home") return 0;
    if (key === "End") return items.length - 1;
    const offset = KEY_OFFSETS[key];
    return offset === undefined ? undefined : index + offset;
  }

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const target = getTargetIndex(event.key, index);
    if (target === undefined) return;
    event.preventDefault();
    focusTab(target);
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label={label} className="flex gap-1 rounded-md bg-surface-container-low p-1">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "min-h-9 rounded px-space-sm text-body-md transition-[background-color] duration-150",
                selected ? "bg-surface-container-lowest font-semibold text-on-surface" : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== activeId}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
