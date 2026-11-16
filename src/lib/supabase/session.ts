import type { SupabaseClient } from "@supabase/supabase-js";

export async function currentUser(client: SupabaseClient) {
  const { data } = await client.auth.getSession();
  return data.session?.user;
}

// Writes that start together (the site photo and its log) share one sign-in instead of creating two anonymous users
const signingIn = new WeakMap<SupabaseClient, Promise<string>>();

async function signInAnonymously(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("Could not start a session");
  return data.user.id;
}

// Anonymous sign-in on the first write, so nobody has to register before trying the app
export async function ensureUserId(client: SupabaseClient): Promise<string> {
  const pending = signingIn.get(client);
  if (pending) return pending;
  const user = await currentUser(client);
  if (user) return user.id;
  const started = signingIn.get(client) ?? signInAnonymously(client).finally(() => signingIn.delete(client));
  signingIn.set(client, started);
  return started;
}

// Turns the anonymous user into a permanent one once the email is confirmed; the projects keep their owner
export async function linkEmail(client: SupabaseClient, email: string, redirectTo: string): Promise<void> {
  const { error } = await client.auth.updateUser({ email }, { emailRedirectTo: redirectTo });
  if (error) throw error;
}
