import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function ProcessingFailure({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div role="alert" data-testid="processing-error" className="flex flex-col gap-space-md rounded-md bg-error-container p-space-md text-on-error-container">
      <p className="flex items-start gap-space-xs text-body-md">
        <Icon name="error" className="mt-0.5" />
        {message}
      </p>
      <div className="flex flex-wrap gap-space-sm">
        <Button onClick={onRetry}>
          <Icon name="refresh" />
          Try again
        </Button>
        <Link href="/subir" className={buttonClasses("ghost")}>
          <Icon name="add_a_photo" />
          Upload another photo
        </Link>
      </div>
    </div>
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
