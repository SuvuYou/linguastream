import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/initializations/db";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import {
  fetchJellyfinWatchItem,
  getJellyfinStreamUrl,
} from "@/lib/db-helpers/jellyfin";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  fetchJellyfinWatchItem: vi.fn(),
  getJellyfinStreamUrl: vi.fn(),
}));

const mockedFetchJellyfinWatchItem = vi.mocked(fetchJellyfinWatchItem);
const mockedGetJellyfinStreamUrl = vi.mocked(getJellyfinStreamUrl);

function mockParams(mediaContentId = "media-1") {
  return {
    params: Promise.resolve({ mediaContentId }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/watch/[mediaContentId]", () => {
  it("returns 401 if user is unauthorized", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(401);

    expect(json).toEqual({
      error: "Unauthorized",
    });

    expect(db.mediaContent.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 if media does not exist", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.empty();

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(404);

    expect(json).toEqual({
      error: "Not found",
    });
  });

  it("returns 403 if user is not owner and not admin", async () => {
    mockGetCurrentUser.base();
    mockDbMediaContent.findUnique.base();

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(403);

    expect(json).toEqual({
      error: "Forbidden",
    });

    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
  });

  it("returns 400 if jellyfin_id is missing", async () => {
    mockGetCurrentUser.admin();
    mockDbMediaContent.findUnique.override({ jellyfin_id: null });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(400);

    expect(json).toEqual({
      error: "No Jellyfin item associated",
    });

    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
  });

  it("returns watch payload for owner", async () => {
    mockGetCurrentUser.override({ id: "owner" });
    mockDbMediaContent.findUnique.override({
      user_id: "owner",
      subtitle_tracks: [{ language: "en" }],
    });

    mockedGetJellyfinStreamUrl.mockReturnValue(
      "http://stream.example/jellyfinId",
    );

    mockedFetchJellyfinWatchItem.mockResolvedValue({
      Id: "id",
      Name: "Movie",
      Type: "Movie",
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      id: "mediaId",
      title: "Movie",
      streamUrl: "http://stream.example/jellyfinId",
      sourceLanguage: "en",
      translationLanguages: [],
    });

    expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("jellyfinId");

    expect(mockedFetchJellyfinWatchItem).toHaveBeenCalledWith("jellyfinId");
  });

  it("returns empty translationLanguages if only source language exists", async () => {
    mockGetCurrentUser.admin();
    mockDbMediaContent.findUnique.override({
      subtitle_tracks: [{ language: "en" }],
    });

    mockedGetJellyfinStreamUrl.mockReturnValue("stream-url");

    mockedFetchJellyfinWatchItem.mockResolvedValue({
      Id: "id",
      Name: "Movie",
      Type: "Movie",
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(json.translationLanguages).toEqual([]);
  });
});
