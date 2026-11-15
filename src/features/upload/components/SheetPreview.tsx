"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Point } from "@/schemas/floor-plan";
import { useSheetEdits } from "../hooks/useSheetEdits";
import type { Sheet } from "../types";
import { rectFromPoints } from "../utils";
import { PointPicker } from "./PointPicker";
import { SheetToolbar } from "./SheetToolbar";

type SheetPreviewProps = {
  sheet: Sheet;
  floor: number;
  footer: ReactNode;
};

export function SheetPreview({ sheet, floor, footer }: SheetPreviewProps) {
  const edits = useSheetEdits(sheet);
  const [corners, setCorners] = useState<Point[] | null>(null);
  const cropping = corners !== null;
  const [a, b] = corners ?? [];
  const cropRect = a && b ? rectFromPoints(a, b) : null;

  async function applyCrop() {
    if (!cropRect || cropRect.width < 10 || cropRect.height < 10) return;
    await edits.crop(cropRect);
    setCorners(null);
  }

  return (
    <div data-testid="plan-preview" className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface-container-lowest">
      <SheetToolbar
        fileName={sheet.fileName}
        busy={edits.busy}
        contrast={sheet.edits.contrast}
        cropping={cropping}
        edited={edits.edited}
        onRotate={edits.rotate}
        onContrast={edits.toggleContrast}
        onCrop={() => setCorners(cropping ? null : [])}
        onReset={edits.reset}
      />
      <div className="bg-surface-container p-space-sm">
        {cropping ? (
          <PointPicker
            image={sheet.image}
            points={corners}
            shape="rect"
            label={`Floor ${floor} plan, crop area`}
            instructions="Click or tap two opposite corners of the area to keep. With a keyboard, move with the arrow keys and press Enter."
            onPick={(point) => setCorners((current) => (current && current.length < 2 ? [...current, point] : [point]))}
            testId="crop-area"
          />
        ) : (
          <Image src={sheet.image.url} alt={`Floor ${floor} plan`} width={sheet.image.width} height={sheet.image.height} unoptimized className="mx-auto block h-auto max-h-[60dvh] w-auto max-w-full" />
        )}
      </div>
      {cropping ? (
        <div className="flex flex-wrap items-center justify-end gap-space-sm border-t border-line px-space-sm py-space-xs">
          <Button variant="ghost" onClick={() => setCorners(null)}>
            Cancel crop
          </Button>
          <Button onClick={applyCrop} disabled={!cropRect || edits.busy}>
            <Icon name="crop" />
            Apply crop
          </Button>
        </div>
      ) : (
        footer
      )}
    </div>
  );
}
