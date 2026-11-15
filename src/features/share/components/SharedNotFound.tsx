import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";

export function SharedNotFound() {
  return (
    <div data-testid="shared-not-found" className="mx-auto flex w-full max-w-xl flex-col items-start gap-space-md px-gutter py-space-xl">
      <Icon name="link_off" size={40} className="text-primary" />
      <h1 className="font-display text-headline-md text-balance">This link doesn’t open a home</h1>
      <p className="text-body-md text-pretty text-on-surface-variant">It may be missing a few characters, or the owner stopped sharing it. Ask them to send it to you again.</p>
      <div className="flex flex-wrap gap-space-sm">
        <Link href={`/compartir/${DEFAULT_PROJECT_ID}`} className={buttonClasses("primary")}>
          See a sample home
        </Link>
        <Link href="/" className={buttonClasses("ghost")}>
          Go to ObraKadabra
        </Link>
      </div>
    </div>
  );
}
