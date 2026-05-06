import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { indexAllSubtitleLines } from "@/lib/db-helpers/search";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/search", () => ({
  indexAllSubtitleLines: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST api/admin/reindex", () => {
  it("returns 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
    expect(indexAllSubtitleLines).not.toHaveBeenCalled();
  });

  it("returns 403 if user is not admin", async () => {
    mockGetCurrentUser.base();

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({ error: "Forbidden" });
    expect(indexAllSubtitleLines).not.toHaveBeenCalled();
  });

  it("indexes subtitles if admin", async () => {
    mockGetCurrentUser.admin();

    vi.mocked(indexAllSubtitleLines).mockResolvedValue({
      indexed: 16,
      match_tolerance_ms: 1000,
      chunk_size: 50,
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(indexAllSubtitleLines).toHaveBeenCalledOnce();
    expect(json).toEqual({
      indexed: 16,
      match_tolerance_ms: 1000,
      chunk_size: 50,
    });
  });
});
