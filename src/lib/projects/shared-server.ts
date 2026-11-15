import { cache } from "react";
import { createAdminSupabase, createPublicSupabase } from "@/lib/supabase/server";
import { fetchSharedLookup, signPhotoUrl } from "@/lib/supabase/shared";
import type { SharedProject } from "@/schemas/shared";
import { getSharedDemo } from "./demos";

export type SharedResult = { status: "found"; shared: SharedProject } | { status: "missing" } | { status: "on-device" };

// Tokens are base64url, so anything else is rejected before asking the database
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Server only. Without Supabase a shared project can only live in the owner's browser, so the page looks it up there
async function lookUp(token: string): Promise<SharedResult> {
  const demo = getSharedDemo(token);
  if (demo) return { status: "found", shared: demo };
  const client = createPublicSupabase();
  if (!client) return { status: "on-device" };
  if (!TOKEN_PATTERN.test(token)) return { status: "missing" };
  const lookup = await fetchSharedLookup(client, token);
  if (!lookup) return { status: "missing" };
  const admin = createAdminSupabase();
  const photoUrl = lookup.photoPath && admin ? await signPhotoUrl(admin, lookup.photoPath) : undefined;
  return { status: "found", shared: { ...lookup.shared, photoUrl } };
}

// Metadata and page ask for the same token in one request; cache() makes that a single database call
export const loadSharedProject = cache(lookUp);
