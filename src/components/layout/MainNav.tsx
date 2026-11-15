"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { getActiveHref, getMainNavItems } from "@/lib/navigation";

type MainNavProps = {
  variant: "desktop" | "mobile";
};

const NAV_ITEMS = getMainNavItems(DEFAULT_PROJECT_ID);

const NAV_HREFS = NAV_ITEMS.map((item) => item.href);

// The pathname only exists at request time, so the static shell renders the nav without an active item
export function MainNav({ variant }: MainNavProps) {
  const Nav = variant === "desktop" ? DesktopNav : MobileNav;
  return (
    <Suspense fallback={<Nav />}>
      <ActiveNav Nav={Nav} />
    </Suspense>
  );
}

function ActiveNav({ Nav }: { Nav: typeof DesktopNav }) {
  const pathname = usePathname();
  return <Nav activeHref={getActiveHref(pathname, NAV_HREFS)} />;
}

function DesktopNav({ activeHref }: { activeHref?: string }) {
  return (
    <nav aria-label="Main" data-testid="desktop-nav" className="hidden lg:block">
      <ul className="flex items-center gap-1 rounded-md bg-surface-container-low p-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                data-testid={`nav-link-${item.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center rounded px-space-sm text-body-md whitespace-nowrap transition-[background-color,color] duration-150",
                  active ? "bg-primary-container font-semibold text-on-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNav({ activeHref }: { activeHref?: string }) {
  return (
    <nav
      aria-label="Main"
      data-testid="mobile-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-container-lowest pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                data-testid={`nav-link-${item.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-body-sm transition-[color] duration-150",
                  active ? "font-semibold text-primary" : "text-on-surface-variant",
                )}
              >
                <Icon name={item.icon} size={24} filled={active} />
                <span className="max-w-full truncate">{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
