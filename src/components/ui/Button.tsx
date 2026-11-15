import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "milestone" | "ai" | "ghost" | "success";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-container text-on-primary hover:bg-primary-hover",
  milestone: "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim",
  ai: "bg-ai-tint text-ai-strong hover:bg-tertiary-fixed",
  ghost: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
  // The darker status green keeps white text at 4.5:1; the base green is for fills and dots only
  success: "bg-status-done-text text-on-primary hover:bg-status-done-text/85",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-10 max-sm:min-h-11 items-center justify-center gap-space-xs rounded-md px-space-sm text-body-md font-medium whitespace-nowrap",
    "transition-[background-color,scale] duration-150 ease-out motion-safe:not-disabled:active:scale-[0.96]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
