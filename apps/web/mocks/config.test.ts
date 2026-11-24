import { describe, expect, it } from "vitest";
import { isMockingEnabled, parseMockSetting } from "./config";

describe("parseMockSetting", () => {
  it("is empty when unset", () => {
    expect(parseMockSetting(undefined)).toEqual(new Set());
    expect(parseMockSetting("  ")).toEqual(new Set());
  });

  it("understands all", () => {
    expect(parseMockSetting(" all ")).toBe("all");
  });

  it("splits a comma list", () => {
    expect(parseMockSetting("user, library,,")).toEqual(new Set(["user", "library"]));
  });
});

describe("isMockingEnabled", () => {
  it("is on in development with a setting", () => {
    expect(isMockingEnabled("development", "user")).toBe(true);
    expect(isMockingEnabled("development", "all")).toBe(true);
  });

  it("is off without a setting", () => {
    expect(isMockingEnabled("development", undefined)).toBe(false);
    expect(isMockingEnabled("development", "")).toBe(false);
  });

  it("is never on outside development", () => {
    expect(isMockingEnabled("production", "all")).toBe(false);
    expect(isMockingEnabled("test", "all")).toBe(false);
  });
});
