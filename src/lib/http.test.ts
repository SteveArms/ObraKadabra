import { describe, expect, it } from "vitest";
import { asRequestFailure, failureFromResponse, networkFailure, OFFLINE_MESSAGE, RequestFailure } from "./http";

describe("request failures", () => {
  it("reads the API message and tells a server outage from a bad request", async () => {
    const down = await failureFromResponse(Response.json({ error: "The AI is not configured." }, { status: 503 }), "fallback");
    expect(down).toMatchObject({ message: "The AI is not configured.", kind: "service" });
    const rejected = await failureFromResponse(Response.json({ error: "The plan is too blurry." }, { status: 422 }), "fallback");
    expect(rejected.kind).toBe("request");
    expect((await failureFromResponse(new Response("oops", { status: 500 }), "fallback")).message).toBe("fallback");
  });

  it("explains a missing connection and wraps unknown errors", () => {
    expect(networkFailure("fallback", false)).toMatchObject({ message: OFFLINE_MESSAGE, kind: "offline" });
    expect(networkFailure("fallback", true).kind).toBe("service");
    expect(asRequestFailure(new TypeError("x"), "fallback")).toMatchObject({ message: "fallback", kind: "service" });
    const original = new RequestFailure("kept", "timeout");
    expect(asRequestFailure(original, "fallback")).toBe(original);
  });
});
