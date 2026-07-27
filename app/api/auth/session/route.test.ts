import { POST, DELETE } from "./route";
import { adminAuth } from "@/lib/initializations/firebase/firebase-admin";
import { db } from "@/lib/initializations/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";

vi.mock("@/lib/initializations/firebase/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    createSessionCookie: vi.fn(),
  },
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    user: {
      upsert: vi.fn(),
    },
    deck: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedAdminAuth = vi.mocked(adminAuth);
const mockedDb = vi.mocked(db);

mockedDb.user.upsert.mockResolvedValue({
  id: 1,
  is_admin: false,
});

mockedDb.deck.count.mockResolvedValue(0);

mockedDb.deck.create.mockResolvedValue({
  id: 1,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST api/auth/session", () => {
  it("creates a default deck for a new user", async () => {
    mockedAdminAuth.verifyIdToken.mockResolvedValue({
      uid: "123",
      email: "test@example.com",
    } as DecodedIdToken);

    mockedAdminAuth.createSessionCookie.mockResolvedValue("mock-session");

    mockedDb.user.upsert.mockResolvedValue({
      id: 1,
      is_admin: false,
    });

    mockedDb.deck.count.mockResolvedValue(0);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ idToken: "fake-token" }),
    });

    await POST(req as NextRequest);

    expect(mockedDb.deck.count).toHaveBeenCalledWith({
      where: { user_id: 1 },
    });

    expect(mockedDb.deck.create).toHaveBeenCalledWith({
      data: {
        user_id: 1,
        name: "Default",
        is_default: true,
      },
    });
  });

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
      where: { firebase_uid: "123" },
      update: { email: "test@example.com" },
      select: {
        id: true,
        is_admin: true,
      },
      create: {
        firebase_uid: "123",
        email: "test@example.com",
        native_language: "en",
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
  it("clears session cookie", async () => {
    const res = await DELETE();

    const cookie = res.cookies.get("session");
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe("");
  });
});
