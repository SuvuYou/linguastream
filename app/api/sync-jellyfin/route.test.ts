import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  bulkPopulateMediaContentWithJellyfinItems,
  fetchAllRegisteredJellyfinIds,
} from "@/lib/db-helpers/media";
import { fetchJellyfinLibrary } from "@/lib/db-helpers/jellyfin";
import type { User } from "@prisma/client";
import { JellyfinItem } from "@/types";

vi.mock("@/lib/initializations/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/media", () => ({
  bulkPopulateMediaContentWithJellyfinItems: vi.fn(),
  fetchAllRegisteredJellyfinIds: vi.fn(),
}));

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  fetchJellyfinLibrary: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const mockedbulkPopulateMediaContentWithJellyfinItems = vi.mocked(bulkPopulateMediaContentWithJellyfinItems);
const mockedFetchAllRegisteredJellyfinIds = vi.mocked(
  fetchAllRegisteredJellyfinIds,
);

const mockedFetchJellyfinLibrary = vi.mocked(fetchJellyfinLibrary);

describe("POST api/sync-jellyfin", () => {
  it("returns 403 if user is not admin", async () => {
    mockedGetCurrentUser.mockResolvedValue({ is_admin: false } as User);

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({ error: "Forbidden" });
  });

  it("returns 403 if no user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const res = await POST();

    expect(res.status).toBe(403);
  });

  it("syncs new Jellyfin items only", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "u1",
      is_admin: true,
    } as User);

    mockedFetchJellyfinLibrary.mockResolvedValue([
      { Id: "1", Name: "A" },
      { Id: "2", Name: "B" },
    ] as JellyfinItem[]);

    mockedFetchAllRegisteredJellyfinIds.mockResolvedValue(
      new Set(["1"]), // already exists
    );

    mockedbulkPopulateMediaContentWithJellyfinItems.mockResolvedValue({ count: 1 });

    const res = await POST();
    const json = await res.json();

    expect(mockedbulkPopulateMediaContentWithJellyfinItems).toHaveBeenCalledWith(
      [{ jellyfin_id: "2", title: "B" }],
      "u1",
    );

    expect(json).toEqual({
      synced: 1,
      total: 2,
      alreadyRegistered: 1,
    });
  });

  it("handles no new items gracefully", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "u1",
      is_admin: true,
    } as User);

    mockedFetchJellyfinLibrary.mockResolvedValue([
      { Id: "1", Name: "A" },
    ] as JellyfinItem[]);

    mockedFetchAllRegisteredJellyfinIds.mockResolvedValue(new Set(["1"]));

    mockedbulkPopulateMediaContentWithJellyfinItems.mockResolvedValue({ count: 0 });

    const res = await POST();
    const json = await res.json();

    expect(json.synced).toBe(0);
  });
});
