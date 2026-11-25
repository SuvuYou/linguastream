import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function request(path: string, session?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (session) req.cookies.set("session", session);
  return req;
}

function redirectTarget(res: Response) {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname : null;
}

afterEach(() => vi.unstubAllEnvs());

describe("proxy", () => {
  it("sends signed-out users to sign-in", async () => {
    const res = await proxy(request("/dashboard/decks"));
    expect(redirectTarget(res)).toBe("/auth/signin");
  });

  it("lets signed-in users through", async () => {
    const res = await proxy(request("/dashboard/decks", "cookie"));
    expect(redirectTarget(res)).toBeNull();
  });

  it("sends signed-in users away from the auth pages", async () => {
    const res = await proxy(request("/auth/signin", "cookie"));
    expect(redirectTarget(res)).toBe("/");
  });

  describe("with mocks", () => {
    it("treats a mocked user as signed in during development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_API_MOCKS", "user");

      const res = await proxy(request("/dashboard/decks"));

      expect(redirectTarget(res)).toBeNull();
    });

    it("still redirects when only other groups are mocked", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_API_MOCKS", "watch");

      const res = await proxy(request("/dashboard/decks"));

      expect(redirectTarget(res)).toBe("/auth/signin");
    });

    it("never skips sign-in in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_API_MOCKS", "all");

      const res = await proxy(request("/dashboard/decks"));

      expect(redirectTarget(res)).toBe("/auth/signin");
    });
  });
});
