import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageSectionProps = {
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

export function PageSection({ labelledBy, className, children }: PageSectionProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("flex w-full flex-col gap-space-lg px-gutter py-space-xl lg:px-gutter-desktop", className)}
    >
      {children}
    </section>
  );
}
