import Link from "next/link";
import { FailureNotice } from "@/components/layout/FailureNotice";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { RequestFailure } from "@/lib/http";

export function ProcessingFailure({ failure, onRetry }: { failure: RequestFailure | null; onRetry: () => void }) {
  return (
    <FailureNotice message={failure?.message ?? ""} kind={failure?.kind} onRetry={onRetry} testId="processing-error">
      <Link href="/subir" className={buttonClasses("ghost")}>
        <Icon name="add_a_photo" />
        Upload another photo
      </Link>
    </FailureNotice>
  );
}

export function NothingToProcess() {
  return (
    <div className="flex flex-col items-center gap-space-md rounded-lg border border-line bg-surface-container-lowest p-space-lg text-center">
      <p className="text-body-lg text-pretty text-on-surface-variant">Upload a photo of your plan and calibrate its scale first.</p>
      <Link href="/subir" className={buttonClasses("primary")}>
        <Icon name="upload_file" />
        Upload a plan
      </Link>
    </div>
  );
}
