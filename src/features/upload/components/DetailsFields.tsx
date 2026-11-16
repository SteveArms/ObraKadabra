"use client";

import { MIN_FLOOR_HEIGHT } from "@/data/structure";
import { cn } from "@/lib/cn";
import type { RoofType } from "@/schemas/floor-plan";
import { useUploadStore } from "../store";
import type { LevelOption } from "../types";
import { FieldError } from "./FieldError";
import { MetersInput } from "@/components/ui/MetersInput";

const LEVEL_OPTIONS: { value: LevelOption; label: string }[] = [
  { value: 1, label: "1 floor" },
  { value: 2, label: "2 floors" },
  { value: 3, label: "3 floors + rooftop" },
];

const ROOF_OPTIONS: { value: RoofType; label: string }[] = [
  { value: "concrete_slab", label: "Lightweight slab, h = 0.20 m (brick)" },
  { value: "metal_sheet", label: "Metal sheet roof" },
];

const FOCUS_RING = "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-container";
const FIELD = cn("min-h-11 w-full rounded-md border bg-surface-container-lowest px-space-sm text-body-lg outline-none", FOCUS_RING);
const border = (error?: string) => (error ? "border-error" : "border-outline-variant");

export function NameField({ error }: { error?: string }) {
  const name = useUploadStore((state) => state.details.name);
  const setDetails = useUploadStore((state) => state.setDetails);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="project-name" className="text-body-md font-medium">Project name</label>
      <input
        id="project-name"
        name="project-name"
        autoComplete="off"
        placeholder="My home in San Juan de Lurigancho"
        value={name}
        aria-invalid={error ? true : undefined}
        aria-describedby="project-name-error"
        onChange={(event) => setDetails({ name: event.target.value })}
        className={cn(FIELD, border(error))}
      />
      <FieldError id="project-name-error" message={error} />
    </div>
  );
}

export function LevelsField({ error }: { error?: string }) {
  const levels = useUploadStore((state) => state.details.levels);
  const setDetails = useUploadStore((state) => state.setDetails);
  return (
    <fieldset className="flex flex-col gap-space-xs" aria-describedby="levels-error">
      <legend className="mb-space-xs text-body-md font-medium">Floors to budget</legend>
      <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-3">
        {LEVEL_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-surface-container-high px-space-sm text-body-md font-medium transition-colors duration-150 has-checked:bg-primary-container has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-container"
          >
            <input type="radio" name="levels" value={option.value} checked={levels === option.value} onChange={() => setDetails({ levels: option.value })} className="sr-only" />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id="levels-error" message={error} />
    </fieldset>
  );
}

export function FloorHeightField({ error }: { error?: string }) {
  const floorHeight = useUploadStore((state) => state.details.floorHeight);
  const setDetails = useUploadStore((state) => state.setDetails);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="floor-height" className="text-body-md font-medium">Floor-to-floor height</label>
      <MetersInput id="floor-height" name="floor-height" value={floorHeight} invalid={Boolean(error)} aria-describedby="floor-height-hint floor-height-error" onChange={(event) => setDetails({ floorHeight: event.target.value })} />
      <p id="floor-height-hint" className="font-mono text-body-sm text-on-surface-variant">Lowest we accept: {MIN_FLOOR_HEIGHT.toFixed(2)} m</p>
      <FieldError id="floor-height-error" message={error} />
    </div>
  );
}

export function RoofTypeField() {
  const roofType = useUploadStore((state) => state.details.roofType);
  const setDetails = useUploadStore((state) => state.setDetails);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="roof-type" className="text-body-md font-medium">Roof type</label>
      <select
        id="roof-type"
        name="roof-type"
        value={roofType}
        aria-describedby="roof-type-hint"
        onChange={(event) => setDetails({ roofType: ROOF_OPTIONS.find((option) => option.value === event.target.value)?.value ?? "concrete_slab" })}
        className={cn(FIELD, "border-outline-variant")}
      >
        {ROOF_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <p id="roof-type-hint" className="font-mono text-body-sm text-on-surface-variant">Sets the roof concrete in the budget</p>
    </div>
  );
}
