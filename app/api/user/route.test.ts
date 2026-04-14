import { GET } from "./route";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@prisma/client";

vi.mock("@/lib/initializations/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe("GET api/user", () => {
  it("returns 401 if user is not logged in", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns current user data", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      display_name: "John",
      native_language: "en",
      is_admin: true,
    } as User);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      id: "u1",
      email: "test@example.com",
      display_name: "John",
      native_language: "en",
      is_admin: true,
    });
  });
});
