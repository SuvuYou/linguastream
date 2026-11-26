import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("keeps a same-site path with its query", () => {
    expect(safeNextPath("/extension/connect")).toBe("/extension/connect");
    expect(safeNextPath("/watch/1?t=30")).toBe("/watch/1?t=30");
  });

  it("falls back to / for anything that could leave the site", () => {
    for (const next of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "extension/connect"]) {
      expect(safeNextPath(next)).toBe("/");
    }
  });
});
