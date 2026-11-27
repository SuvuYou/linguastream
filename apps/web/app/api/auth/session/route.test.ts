import { POST, DELETE, RECENT_SIGN_IN_SECONDS } from "./route";
import { adminAuth } from "@/lib/initializations/firebase/firebase-admin";
import { db } from "@/lib/initializations/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";

vi.mock("@/lib/initializations/firebase/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    createSessionCookie: vi.fn(),
    verifySessionCookie: vi.fn(),
    revokeRefreshTokens: vi.fn(),
  },
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    user: {
      upsert: vi.fn(),
    },
  },
}));

const mockedAdminAuth = vi.mocked(adminAuth);

function signIn(idToken: string, origin: string | null = "http://localhost") {
  return new NextRequest("http://localhost/api/auth/session", {
    method: "POST",
    headers: origin ? { origin } : {},
    body: JSON.stringify({ idToken }),
  });
}
const mockedDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST api/auth/session", () => {
  it("creates session and upserts user", async () => {
    mockedAdminAuth.verifyIdToken.mockResolvedValue({
      uid: "123",
      email: "test@example.com",
      auth_time: Math.floor(Date.now() / 1000) - 10,
    } as DecodedIdToken);

    mockedAdminAuth.createSessionCookie.mockResolvedValue("mock-session");

    const req = signIn("fake-token");

    const res = await POST(req);
    const json = await res.json();

    expect(json).toEqual({ ok: true });

    expect(mockedAdminAuth.verifyIdToken).toHaveBeenCalledWith(
      "fake-token",
      true,
    );

    expect(mockedDb.user.upsert).toHaveBeenCalledWith({
      where: { firebaseUid: "123" },
      update: { email: "test@example.com" },
      create: {
        firebaseUid: "123",
        email: "test@example.com",
        nativeLanguage: "en",
        learningLanguage: "de",
      },
    });

    expect(mockedAdminAuth.createSessionCookie).toHaveBeenCalled();

    const cookies = res.cookies.get("session");

    expect(cookies).toBeDefined();
  });

  it("return 401 if firebase fails", async () => {
    mockedAdminAuth.verifyIdToken.mockRejectedValue(new Error("invalid"));

    const res = await POST(signIn("bad-token"));

    expect(res.status).toBe(401);
  });

  it("refuses a sign-in older than five minutes", async () => {
    mockedAdminAuth.verifyIdToken.mockResolvedValue({
      uid: "123",
      auth_time: Math.floor(Date.now() / 1000) - RECENT_SIGN_IN_SECONDS - 60,
    } as DecodedIdToken);

    const res = await POST(signIn("old-token"));

    expect(res.status).toBe(401);
    expect(mockedAdminAuth.createSessionCookie).not.toHaveBeenCalled();
    expect(mockedDb.user.upsert).not.toHaveBeenCalled();
  });

  it.each([[undefined], ["https://evil.example"]])(
    "refuses a request from another origin (%s)",
    async (origin) => {
      const res = await POST(signIn("fake-token", origin ?? null));

      expect(res.status).toBe(403);
      expect(mockedAdminAuth.verifyIdToken).not.toHaveBeenCalled();
    },
  );

  it("compares against WEB_ORIGIN when it's set", async () => {
    vi.stubEnv("WEB_ORIGIN", "https://linguastream.example");
    const res = await POST(signIn("fake-token"));
    expect(res.status).toBe(403);
    vi.unstubAllEnvs();
  });
});

describe("DELETE api/auth/session", () => {
  function logout(cookie?: string, origin = "http://localhost") {
    const req = new NextRequest("http://localhost/api/auth/session", {
      method: "DELETE",
      headers: { origin, ...(cookie ? { cookie: `session=${cookie}` } : {}) },
    });
    return DELETE(req);
  }

  it("refuses a request from another origin", async () => {
    const res = await logout("valid-cookie", "https://evil.example");
    expect(res.status).toBe(403);
    expect(mockedAdminAuth.revokeRefreshTokens).not.toHaveBeenCalled();
  });

  it("revokes the user's Firebase sessions, signing the extension out too", async () => {
    mockedAdminAuth.verifySessionCookie.mockResolvedValue({ uid: "123" } as DecodedIdToken);

    const res = await logout("valid-cookie");

    expect(mockedAdminAuth.verifySessionCookie).toHaveBeenCalledWith("valid-cookie");
    expect(mockedAdminAuth.revokeRefreshTokens).toHaveBeenCalledWith("123");
    expect(res.cookies.get("session")?.value).toBe("");
  });

  it("clears an invalid cookie without revoking anything", async () => {
    mockedAdminAuth.verifySessionCookie.mockRejectedValue(new Error("expired"));

    const res = await logout("expired-cookie");

    expect(mockedAdminAuth.revokeRefreshTokens).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.cookies.get("session")?.value).toBe("");
  });

  it("clears the cookie when there is none to revoke", async () => {
    const res = await logout();

    expect(mockedAdminAuth.verifySessionCookie).not.toHaveBeenCalled();
    expect(res.cookies.get("session")).toBeDefined();
  });
});
