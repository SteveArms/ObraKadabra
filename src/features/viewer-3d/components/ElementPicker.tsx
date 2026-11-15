"use client";

import { ELEMENT_TYPE_LABELS } from "../scene";
import { statusOf, useViewerStore } from "../store";

// Keyboard and screen-reader path to every element, so selection never depends on clicking the canvas; each option exposes its plan-vs-actual status for tests
export function ElementPicker() {
  const entries = useViewerStore((state) => state.entries);
  const selectedKey = useViewerStore((state) => state.selectedKey);
  const select = useViewerStore((state) => state.select);
  const statuses = useViewerStore((state) => state.statuses);
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key, "en", { numeric: true }));

  return (
    <label className="flex items-center">
      <span className="sr-only">Select element</span>
      <select
        value={selectedKey ?? ""}
        onChange={(event) => select(event.target.value || undefined)}
        className="min-h-8 w-28 sm:w-auto sm:max-w-36 rounded-md bg-surface-container-high px-2 text-base text-on-surface sm:text-body-sm"
      >
        <option value="">Element…</option>
        {sorted.map((entry) => (
          <option key={entry.key} value={entry.key} data-testid={`element-option-${entry.id}`} data-status={statusOf(statuses, entry.key)}>
            {ELEMENT_TYPE_LABELS[entry.type]} {entry.id}
          </option>
        ))}
      </select>
    </label>
  );
}
