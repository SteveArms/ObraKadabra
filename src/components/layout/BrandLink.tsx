import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function BrandLink() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-space-xs rounded-md">
      <Icon name="deployed_code" size={28} filled className="text-primary-container" />
      <span className="font-display text-headline-sm tracking-tight text-primary">ObraKadabra</span>
    </Link>
  );
}
