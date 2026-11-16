import { describe, expect, it } from "vitest";
import { createFakeSupabase } from "./fake-client";
import { ensureUserId } from "./session";

describe("ensureUserId", () => {
  it("creates a single anonymous user when two writes start at the same time", async () => {
    const { client, db } = createFakeSupabase();
    const [first, second] = await Promise.all([ensureUserId(client), ensureUserId(client)]);
    expect(first).toBe(second);
    expect(db.userId).toBe("user-1");
    expect(await ensureUserId(client)).toBe("user-1");
  });
});
