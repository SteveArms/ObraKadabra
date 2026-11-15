"use client";

import Image from "next/image";
import { FileButton } from "@/components/ui/FileButton";
import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@/lib/format";
import { useProgressStore } from "../store";
import { StepCard } from "./StepCard";

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

// On phones the input opens the rear camera; on desktop it opens the file picker
export function CaptureStep({ onPhoto, busy }: { onPhoto: (file: File | undefined) => void; busy: boolean }) {
  const photo = useProgressStore((state) => state.photo);
  if (!photo) {
    return (
      <StepCard step={2} title="Site photo" icon="add_a_photo">
        <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container p-space-lg text-center">
          <FileButton label="Upload or take a site photo" icon="photo_camera" accept={PHOTO_ACCEPT} capture variant="milestone" onFile={onPhoto} disabled={busy} testId="site-photo-input" className="min-h-14 px-space-lg text-body-lg font-semibold" />
          <p className="max-w-[40ch] text-body-sm text-pretty text-on-surface-variant">Take it in daylight, wide enough to show the whole area you built this week. JPG, PNG or WebP.</p>
        </div>
      </StepCard>
    );
  }
  return (
    <StepCard step={2} title="Site photo" icon="add_a_photo" aside={<FileButton label="Retake" icon="refresh" accept={PHOTO_ACCEPT} capture onFile={onPhoto} disabled={busy} className="min-h-8 text-body-sm" />}>
      <figure className="flex flex-col gap-space-xs">
        <Image src={photo.url} alt="Site photo to analyze" width={1600} height={1067} unoptimized data-testid="site-photo-preview" className="h-auto max-h-80 w-full rounded-md object-cover outline-1 -outline-offset-1 outline-black/10" />
        <figcaption className="flex flex-wrap items-center justify-between gap-space-xs font-mono text-label-numeric-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name="schedule" size={14} />
            Received today · {time.format(new Date(photo.takenAt))}
          </span>
          <span className="[overflow-wrap:anywhere]">
            {photo.name} · {formatBytes(photo.size)}
          </span>
        </figcaption>
      </figure>
    </StepCard>
  );
}
