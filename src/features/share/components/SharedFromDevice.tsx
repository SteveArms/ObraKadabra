"use client";

import { useEffect, useState } from "react";
import { getProjectRepository } from "@/lib/projects";
import type { SharedProject } from "@/schemas/shared";
import { SharedHome } from "./SharedHome";
import { SharedNotFound } from "./SharedNotFound";

type DeviceState = { status: "loading" } | { status: "missing" } | { status: "ready"; shared: SharedProject; now: number };

// Without cloud storage the shared project only exists in the owner's browser, so this page looks for it there
export function SharedFromDevice({ token }: { token: string }) {
  const [state, setState] = useState<DeviceState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getProjectRepository()
      .getShared(token)
      .catch(() => undefined)
      .then((shared) => active && setState(shared ? { status: "ready", shared, now: Date.now() } : { status: "missing" }));
    return () => {
      active = false;
    };
  }, [token]);

  if (state.status === "loading") return <p className="px-gutter py-space-xl text-body-md lg:px-gutter-desktop">Opening the home…</p>;
  if (state.status === "missing") return <SharedNotFound />;
  return <SharedHome shared={state.shared} now={state.now} />;
}
