"use client";

import { useEffect, useState } from "react";
import { supabaseConfig } from "@/lib/supabase/config";

export type LinkEmailStatus = "hidden" | "anonymous" | "sending" | "sent" | "error";

// The SDK is loaded only when cloud storage is on, the only case where there is an account to link
async function cloudAccount() {
  if (!supabaseConfig()) return undefined;
  const { currentUser, getBrowserSupabase, linkEmail } = await import("@/lib/supabase");
  const client = getBrowserSupabase();
  return client ? { client, currentUser, linkEmail } : undefined;
}

// Only an anonymous cloud session can be linked; local-only storage and registered users never see the form
export function useLinkEmail() {
  const [status, setStatus] = useState<LinkEmailStatus>("hidden");

  useEffect(() => {
    let active = true;
    cloudAccount()
      .then((account) => account?.currentUser(account.client))
      .then((user) => active && user?.is_anonymous && setStatus("anonymous"))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const submit = async (email: string) => {
    setStatus("sending");
    await cloudAccount()
      .then((account) => (account ? account.linkEmail(account.client, email, window.location.origin) : Promise.reject(new Error("No cloud account"))))
      .then(() => setStatus("sent"))
      .catch(() => setStatus("error"));
  };

  return { status, submit };
}
