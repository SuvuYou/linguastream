import { describe, expect, it } from "vitest";
import { isGroupMocked, isMockingEnabled, parseMockSetting } from "./config";

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

describe("isGroupMocked", () => {
  it("is on for a listed group or all, in development", () => {
    expect(isGroupMocked("user", "development", "user,watch")).toBe(true);
    expect(isGroupMocked("user", "development", "all")).toBe(true);
  });

  it("is off for groups that aren't listed", () => {
    expect(isGroupMocked("user", "development", "watch")).toBe(false);
  });

  it("is never on outside development", () => {
    expect(isGroupMocked("user", "production", "all")).toBe(false);
  });
});
