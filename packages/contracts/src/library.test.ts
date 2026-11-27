import { describe, expect, it } from "vitest";
import { LIBRARY_SEARCH_MAX, LibraryPage, listVideosRoute } from "./library.js";

const video = {
  id: "0190f3c2-7d1a-7c00-8a00-000000000001",
  youtube_video_id: "4Ja5iJtYOPw",
  title: "Ein Tag in Hamburg",
  channel_name: "Nordlicht Reisen",
  duration_ms: 768_000,
  added_at: "2026-11-27T01:00:00.000Z",
  track: { id: "0190f3c2-7d1a-7c00-8a00-000000000002", status: "processing", progress: 2, error_code: null },
  translation: { language: "uk", status: "none" },
};

const query = listVideosRoute.query!;

describe("library contract", () => {
  it("is GET /api/videos", () => {
    expect([listVideosRoute.method, listVideosRoute.path]).toEqual(["GET", "/api/videos"]);
  });

  it("accepts a page of videos with or without a track", () => {
    const page = { items: [video, { ...video, track: null }], page: 0, page_size: 24, total: 2 };
    expect(LibraryPage.parse(page)).toEqual(page);
    expect(LibraryPage.safeParse({ ...page, items: [{ ...video, added_at: "yesterday" }] }).success).toBe(false);
    expect(
      LibraryPage.safeParse({ ...page, items: [{ ...video, track: { ...video.track, error_code: "oops" } }] }).success,
    ).toBe(false);
  });

  it("defaults to the first page and drops an empty search", () => {
    expect(query.parse({})).toEqual({ page: 0 });
    expect(query.parse({ page: "3", q: "  " })).toEqual({ page: 3 });
    expect(query.parse({ q: " Hamburg " })).toEqual({ page: 0, q: "Hamburg" });
  });

  it("rejects a bad page or a long search", () => {
    expect(query.safeParse({ page: "-1" }).success).toBe(false);
    expect(query.safeParse({ page: "x" }).success).toBe(false);
    expect(query.safeParse({ q: "a".repeat(LIBRARY_SEARCH_MAX + 1) }).success).toBe(false);
  });
});
