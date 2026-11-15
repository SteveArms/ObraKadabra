"use client";

import { useEffect, useState } from "react";
import { currentUser, getBrowserSupabase, linkEmail } from "@/lib/supabase";

export type LinkEmailStatus = "hidden" | "anonymous" | "sending" | "sent" | "error";

// Only an anonymous cloud session can be linked; local-only storage and registered users never see the form
export function useLinkEmail() {
  const [status, setStatus] = useState<LinkEmailStatus>("hidden");

  useEffect(() => {
    const client = getBrowserSupabase();
    if (!client) return;
    let active = true;
    currentUser(client)
      .then((user) => active && user?.is_anonymous && setStatus("anonymous"))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const submit = async (email: string) => {
    const client = getBrowserSupabase();
    if (!client) return;
    setStatus("sending");
    await linkEmail(client, email, window.location.origin)
      .then(() => setStatus("sent"))
      .catch(() => setStatus("error"));
  };

  return { status, submit };
}
