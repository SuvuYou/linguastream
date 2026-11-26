import { POST, DELETE } from "./route";
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
const mockedDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST api/auth/session", () => {
  it("creates session and upserts user", async () => {
    mockedAdminAuth.verifyIdToken.mockResolvedValue({
      uid: "123",
      email: "test@example.com",
    } as DecodedIdToken);

    mockedAdminAuth.createSessionCookie.mockResolvedValue("mock-session");

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ idToken: "fake-token" }),
    });

    const res = await POST(req as NextRequest);
    const json = await res.json();

    expect(json).toEqual({ ok: true });

    expect(mockedAdminAuth.verifyIdToken).toHaveBeenCalledWith("fake-token");

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

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ idToken: "bad-token" }),
    });

    const res = await POST(req as NextRequest);

    expect(res.status).toBe(401);
  });
});

describe("DELETE api/auth/session", () => {
  function logout(cookie?: string) {
    const req = new NextRequest("http://localhost/api/auth/session", {
      method: "DELETE",
      headers: cookie ? { cookie: `session=${cookie}` } : {},
    });
    return DELETE(req);
  }

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
