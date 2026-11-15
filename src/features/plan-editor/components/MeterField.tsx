"use client";

import { useId, useState } from "react";
import { parseMeters } from "@/lib/format";

type MeterFieldProps = { label: string; value: number; onCommit: (meters: number) => void; min?: number; testId?: string };

const FIELD = "flex items-center gap-1 rounded-md border border-outline-variant bg-surface-container-lowest px-space-xs focus-within:outline-2 focus-within:outline-primary-container";

// Commits on Enter or when focus leaves; the parent remounts it with a new key when the value changes elsewhere
export function MeterField({ label, value, onCommit, min = 0.01, testId }: MeterFieldProps) {
  const id = useId();
  const [text, setText] = useState(value.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const meters = parseMeters(text);
    if (meters === null || meters < min) return setError(`Enter at least ${min.toFixed(2)} m, such as ${Math.max(value, min).toFixed(2)}.`);
    setError(null);
    if (Math.abs(meters - value) > 1e-6) onCommit(meters);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body-sm text-on-surface-variant">
        {label}
      </label>
      <div className={FIELD}>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          data-testid={testId}
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && commit()}
          className="min-h-9 w-full min-w-0 bg-transparent font-mono text-label-numeric-md tabular-nums outline-none"
        />
        <span aria-hidden="true" className="font-mono text-label-numeric-sm text-outline">
          m
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ReadOnlyField({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span data-testid={testId} className="flex min-h-9 items-center rounded-md bg-surface-container px-space-xs font-mono text-label-numeric-md text-on-surface">
        {value}
      </span>
    </div>
  );
}
