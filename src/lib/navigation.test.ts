import { describe, expect, it } from "vitest";
import { getActiveHref, getMainNavItems, isFocusedFlow } from "./navigation";

const hrefs = getMainNavItems("demo-1").map((item) => item.href);

describe("getActiveHref", () => {
  it("marks home only on the root path", () => {
    expect(getActiveHref("/", hrefs)).toBe("/");
    expect(getActiveHref("/subir", hrefs)).toBe("/subir");
  });

  it("prefers the most specific route", () => {
    expect(getActiveHref("/proyecto/demo-1/editor", hrefs)).toBe("/proyecto/demo-1/editor");
    expect(getActiveHref("/proyecto/demo-1", hrefs)).toBe("/proyecto/demo-1");
  });

  it("matches nested paths and ignores trailing slashes", () => {
    expect(getActiveHref("/subir/escala", hrefs)).toBe("/subir");
    expect(getActiveHref("/proyecto/demo-1/avance/", hrefs)).toBe("/proyecto/demo-1/avance");
  });

  it("returns undefined for routes outside the navigation", () => {
    expect(getActiveHref("/compartir/demo-1", hrefs)).toBeUndefined();
    expect(getActiveHref("/subirx", hrefs)).toBeUndefined();
  });
});

describe("isFocusedFlow", () => {
  it("covers the upload wizard and its processing screen only", () => {
    expect(isFocusedFlow("/subir")).toBe(true);
    expect(isFocusedFlow("/subir/procesando")).toBe(true);
    expect(isFocusedFlow("/proyecto/x")).toBe(false);
  });
});
