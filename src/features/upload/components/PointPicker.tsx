"use client";

import Image from "next/image";
import { useId } from "react";
import type { Point } from "@/schemas/floor-plan";
import { usePointPicker } from "../hooks/usePointPicker";
import type { Raster } from "../types";
import { rectFromPoints } from "../utils";

type PointPickerProps = {
  image: Raster;
  points: Point[];
  shape: "line" | "rect";
  label: string;
  instructions: string;
  onPick: (point: Point) => void;
  testId: string;
};

const MARKS = ["A", "B"];

type OverlayProps = { image: Raster; points: Point[]; shape: "line" | "rect"; cursor?: Point };

function PickerOverlay({ image, points, shape, cursor }: OverlayProps) {
  // Crosshair arm length in image pixels, about 4% of the long side
  const arm = Math.max(image.width, image.height) / 25;
  const [a, b] = points;
  const rect = a && b ? rectFromPoints(a, b) : null;
  return (
    <svg viewBox={`0 0 ${image.width} ${image.height}`} preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      {shape === "line" && a && b ? <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-secondary-container" strokeWidth={3} vectorEffect="non-scaling-stroke" /> : null}
      {shape === "rect" && rect ? <rect {...rect} className="fill-primary-container/10 stroke-primary-container" strokeWidth={2} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" /> : null}
      {cursor ? (
        <g className="stroke-primary-container" strokeWidth={1.5} vectorEffect="non-scaling-stroke">
          <line x1={cursor.x - arm} y1={cursor.y} x2={cursor.x + arm} y2={cursor.y} vectorEffect="non-scaling-stroke" />
          <line x1={cursor.x} y1={cursor.y - arm} x2={cursor.x} y2={cursor.y + arm} vectorEffect="non-scaling-stroke" />
        </g>
      ) : null}
    </svg>
  );
}

// The plan image as one big button: each click, tap or Enter places a point in image pixels
export function PointPicker({ image, points, shape, label, instructions, onPick, testId }: PointPickerProps) {
  const hintId = useId();
  const picker = usePointPicker(image, onPick);
  return (
    <div className="flex flex-col gap-space-xs">
      <button
        type="button"
        aria-label={label}
        aria-describedby={hintId}
        data-testid={testId}
        data-points={points.length}
        onClick={picker.onClick}
        onKeyDown={picker.onKeyDown}
        onFocus={picker.onFocus}
        onBlur={picker.onBlur}
        className="relative mx-auto block w-fit cursor-crosshair overflow-hidden rounded-md bg-surface-container-lowest outline-offset-4"
      >
        <Image src={image.url} alt="" width={image.width} height={image.height} unoptimized draggable={false} className="block h-auto max-h-[60dvh] w-auto max-w-full select-none" />
        <PickerOverlay image={image} points={points} shape={shape} cursor={picker.cursor ?? undefined} />
        {points.map((point, index) => (
          <span
            key={MARKS[index]}
            aria-hidden="true"
            style={{ left: `${(point.x / image.width) * 100}%`, top: `${(point.y / image.height) * 100}%` }}
            className="pointer-events-none absolute flex size-6 -translate-1/2 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-secondary-container font-mono text-label-numeric-sm font-semibold text-on-secondary-container shadow-float"
          >
            {MARKS[index]}
          </span>
        ))}
      </button>
      <p id={hintId} className="text-center text-body-sm text-on-surface-variant">
        {instructions}
      </p>
    </div>
  );
}
