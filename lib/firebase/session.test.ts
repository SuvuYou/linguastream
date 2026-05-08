import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentUser } from "./session";
import { db } from "@/lib/initializations/db";
import { adminAuth } from "@/lib/initializations/firebase/firebase-admin";
import { cookies } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "@prisma/client";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/initializations/firebase/firebase-admin", () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
  },
}));

const mockedCookies = vi.mocked(cookies);
const mockedDb = vi.mocked(db, true);
const mockedAuth = vi.mocked(adminAuth, true);

beforeEach(() => {
  vi.resetAllMocks();
});

const defaultCookie = {
  [Symbol.iterator]: vi.fn(),
  get: () => undefined,
  delete: vi.fn(),
  set: vi.fn(),
  size: 0,
  getAll: vi.fn(),
  has: vi.fn(),
};

describe("getCurrentUser", () => {
  it("returns null when no session cookie exists", async () => {
    mockedCookies.mockResolvedValue(defaultCookie);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns null when session verification fails", async () => {
    mockedCookies.mockResolvedValue({
      ...defaultCookie,
      get: () => ({ value: "token", name: "token" }),
    });

    mockedAuth.verifySessionCookie.mockRejectedValue(new Error("bad token"));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("returns user when session is valid", async () => {
    mockedCookies.mockResolvedValue({
      ...defaultCookie,
      get: () => ({ value: "token", name: "token" }),
    });

    mockedAuth.verifySessionCookie.mockResolvedValue({
      uid: "firebase-123",
    } as DecodedIdToken);

    mockedDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      firebase_uid: "firebase-123",
    } as User);

    const result = await getCurrentUser();

    expect(result).toEqual({
      id: "user-1",
      firebase_uid: "firebase-123",
    });
  });
});
