import { describe, expect, it } from "vitest";
import { ExtensionCode, createExtensionCodeRoute, exchangeExtensionCodeRoute } from "./extension.js";

describe("extension sign-in routes", () => {
  it("are POST /api/extension/code and /api/extension/token", () => {
    expect([createExtensionCodeRoute.method, createExtensionCodeRoute.path]).toEqual(["POST", "/api/extension/code"]);
    expect([exchangeExtensionCodeRoute.method, exchangeExtensionCodeRoute.path]).toEqual(["POST", "/api/extension/token"]);
  });

  it("require an ISO expiry on the code", () => {
    expect(ExtensionCode.safeParse({ code: "c", expires_at: "2026-11-26T12:00:00.000Z" }).success).toBe(true);
    expect(ExtensionCode.safeParse({ code: "c", expires_at: "in two minutes" }).success).toBe(false);
  });

  it("caps the code's length", () => {
    const body = exchangeExtensionCodeRoute.body!;
    expect(body.safeParse({ code: "a".repeat(100) }).success).toBe(true);
    expect(body.safeParse({ code: "a".repeat(101) }).success).toBe(false);
    expect(body.safeParse({ code: "" }).success).toBe(false);
  });
});
