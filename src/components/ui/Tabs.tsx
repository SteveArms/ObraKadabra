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

function targetIndex(key: string, index: number, count: number): number | undefined {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const offset = KEY_OFFSETS[key];
  return offset === undefined ? undefined : (index + offset + count) % count;
}

type TabButtonProps = { item: TabItem; baseId: string; selected: boolean; onSelect: () => void; onKeyDown: (event: KeyboardEvent) => void; buttonRef: (node: HTMLButtonElement | null) => void };

function TabButton({ item, baseId, selected, onSelect, onKeyDown, buttonRef }: TabButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="tab"
      id={`${baseId}-tab-${item.id}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${item.id}`}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        "min-h-9 rounded-md px-space-sm text-body-md transition-[background-color] duration-150 max-sm:min-h-11",
        selected ? "bg-surface-container-lowest font-semibold text-on-surface" : "text-on-surface-variant hover:text-on-surface",
      )}
    >
      {item.label}
    </button>
  );
}

// Roving tab index: arrows, Home and End move between tabs, and only the selected tab is in the Tab order
export function Tabs({ items, label, defaultTabId }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const target = targetIndex(event.key, index, items.length);
    if (target === undefined) return;
    event.preventDefault();
    setActiveId(items[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label={label} className="flex gap-1 rounded-lg bg-surface-container-low p-1">
        {items.map((item, index) => (
          <TabButton key={item.id} item={item} baseId={baseId} selected={item.id === activeId} onSelect={() => setActiveId(item.id)} onKeyDown={(event) => handleKeyDown(event, index)} buttonRef={(node) => void (tabRefs.current[index] = node)} />
        ))}
      </div>
      {items.map((item) => (
        <div key={item.id} role="tabpanel" id={`${baseId}-panel-${item.id}`} aria-labelledby={`${baseId}-tab-${item.id}`} hidden={item.id !== activeId} tabIndex={0}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
