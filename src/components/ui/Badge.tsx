import { STAGE_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { StageStatus } from "@/schemas/stage-status";

type BadgeProps = {
  status: StageStatus;
  label?: string;
};

export function Badge({ status, label }: BadgeProps) {
  const style = STAGE_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-space-xs py-0.5 text-body-sm font-medium whitespace-nowrap text-on-surface",
        style.tintClass,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", style.dotClass)} />
      {label ?? style.label}
    </span>
  );
}
