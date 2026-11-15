"use client";

import { useId } from "react";
import { buttonClasses, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type FileButtonProps = {
  label: string;
  icon: string;
  onFile: (file: File | undefined) => void;
  variant?: ButtonVariant;
  accept: string;
  capture?: boolean;
  disabled?: boolean;
  testId?: string;
  className?: string;
};

// A native file input behind a button-styled label, so keyboard, screen readers and the phone camera all work
export function FileButton({ label, icon, onFile, accept, variant = "ghost", capture = false, disabled, testId, className }: FileButtonProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn(buttonClasses(variant, className), "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-container has-disabled:cursor-not-allowed has-disabled:opacity-50")}>
      <Icon name={icon} />
      {label}
      <input
        id={id}
        type="file"
        className="sr-only"
        data-testid={testId}
        disabled={disabled}
        accept={accept}
        capture={capture ? "environment" : undefined}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </label>
  );
}
