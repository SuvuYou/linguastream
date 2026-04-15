import { describe, expect, it, vi } from "vitest";
import {
  fetchJellyfinLibrary,
  fetchJellyfinWatchItem,
  getJellyfinStreamUrl,
  getThumbnailUrl,
} from "./jellyfin";

describe("jellyfin helpers", () => {
  it("builds thumbnail url", () => {
    const url = getThumbnailUrl("abc");

    expect(url).toContain("/Items/abc/Images/Primary");
  });

  it("builds stream url", () => {
    const url = getJellyfinStreamUrl("123");

    expect(url).toContain("/Videos/123/stream");
  });

  it("fetches library and returns items", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              Items: [{ Id: "1" }, { Id: "2" }],
            }),
        }) as Promise<Response>,
    );

    const result = await fetchJellyfinLibrary({
      searchTerm: "test",
      startIndex: 10,
      limit: 100,
      ids: ["id1", "id2"],
    });

    expect(global.fetch).toHaveBeenCalled();

    expect(result).toHaveLength(2);
  });

  it("throws on fetch failure", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          status: 500,
        }) as Promise<Response>,
    );

    await expect(fetchJellyfinLibrary()).rejects.toThrow("Jellyfin error: 500");
  });

  it("fetches jellyfin watch item", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ Id: "1" }),
        }) as Promise<Response>,
    );

    const result = await fetchJellyfinWatchItem("contentId");

    expect(result.Id).toBe("1");
  });
});
