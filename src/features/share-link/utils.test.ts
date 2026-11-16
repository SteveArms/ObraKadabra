import { describe, expect, it } from "vitest";
import { whatsappShareUrl } from "./utils";

describe("whatsappShareUrl", () => {
  it("puts the link inside an encoded message", () => {
    const url = new URL(whatsappShareUrl("https://obrakadabra.app/compartir/abc"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toContain("https://obrakadabra.app/compartir/abc");
  });
});
