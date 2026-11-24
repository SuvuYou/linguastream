import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";
import { getCurrentUser } from "@/lib/firebase/session";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/search (no search backend until C2)", () => {
  it("returns 401 without a user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns an empty first page for a signed-in user", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      results: [],
      page: 1,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: 30,
    });
  });
});
