import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/watch/[mediaContentId]/stream (no stream source until uploads return)", () => {
  it("returns 401 if user is unauthorized", async () => {
    mockGetCurrentUser.empty();

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns 404 for a signed-in user", async () => {
    mockGetCurrentUser.base();

    const res = await GET();

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "No stream available" });
  });
});
