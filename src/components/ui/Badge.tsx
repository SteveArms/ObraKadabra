import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { ElementStatus } from "@/schemas/schedule";

type BadgeProps = {
  status: ElementStatus;
  label?: string;
};

export function Badge({ status, label }: BadgeProps) {
  const style = ELEMENT_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-space-xs py-0.5 text-body-sm font-medium whitespace-nowrap",
        style.tintClass,
        style.textClass,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", style.dotClass)} />
      {label ?? style.label}
    </span>
  );
}
