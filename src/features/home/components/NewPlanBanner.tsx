import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function NewPlanBanner() {
  return (
    <div className="flex flex-col items-start gap-space-md rounded-xl bg-surface-container-low p-space-lg md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-space-md">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
          <Icon name="add_a_photo" size={32} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-display text-headline-sm text-balance">Have a new plan or a hand-drawn sketch?</p>
          <p className="max-w-[60ch] text-body-md text-pretty text-on-surface-variant">
            Take a clear photo with your phone and upload it. The AI turns it into a plan you can review and edit.
          </p>
        </div>
      </div>
      <Link href="/subir" data-testid="banner-upload" className={buttonClasses("primary", "w-full shrink-0 sm:w-auto")}>
        <Icon name="cloud_upload" />
        Upload plan
      </Link>
    </div>
  );
}
