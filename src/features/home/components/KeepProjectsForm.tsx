"use client";

import { useId, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useLinkEmail } from "../hooks/useLinkEmail";

// Anonymous projects live only as long as this browser's session; an email keeps them for good and on other devices
export function KeepProjectsForm() {
  const { status, submit } = useLinkEmail();
  const inputId = useId();
  if (status === "hidden") return null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email === "string" && email.trim()) void submit(email.trim());
  };

  if (status === "sent") {
    return (
      <p role="status" className="flex items-start gap-space-xs rounded-lg bg-surface-container-low p-space-md text-body-md">
        <Icon name="mark_email_read" className="mt-0.5 text-primary" />
        Check your inbox and confirm the email. Your projects stay here in the meantime.
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md md:flex-row md:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={inputId} className="text-body-md font-medium">
          Keep your projects with your email
        </label>
        <p className="text-body-sm text-on-surface-variant">You’re using ObraKadabra without an account. Add an email to open your projects on any device.</p>
        <input id={inputId} name="email" type="email" required autoComplete="email" spellCheck={false} placeholder="you@example.com" className="min-h-11 rounded-md border border-line bg-surface-container-lowest px-space-sm text-body-md" />
        {status === "error" ? <p role="alert" className="text-body-sm text-on-error-container">We couldn’t send the email. Check the address and try again.</p> : null}
      </div>
      <Button type="submit" disabled={status === "sending"} className="min-h-11">
        {status === "sending" ? "Sending…" : "Send confirmation"}
      </Button>
    </form>
  );
}
