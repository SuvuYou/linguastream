import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/initializations/db";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import {
  fetchJellyfinWatchItem,
  getJellyfinStreamUrl,
} from "@/lib/db-helpers/jellyfin";
import { JELLYFIN_CONTENT_TYPE, YOUTUBE_CONTENT_TYPE } from "@/helpers/const";
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

const mockedFindUnique = vi.mocked(db.mediaContent.findUnique);
const mockedFetchJellyfinWatchItem = vi.mocked(fetchJellyfinWatchItem);
const mockedGetJellyfinStreamUrl = vi.mocked(getJellyfinStreamUrl);

function mockParams(mediaContentId = "mediaId") {
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

    expect(mockedFindUnique).not.toHaveBeenCalled();
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

  it("returns 403 if user is not the owner of private content", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "another-user",
      type: YOUTUBE_CONTENT_TYPE,
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({
      error: "Forbidden",
    });

    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("allows the owner to access private content", async () => {
    mockGetCurrentUser.override({
      id: "id",
    });

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: YOUTUBE_CONTENT_TYPE,
      title: "My video",
      source_language: "en",
      youtube_video_id: "youtube-123",
      subtitle_tracks: [{ language: "en" }, { language: "de" }],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      id: "mediaId",
      title: "My video",
      type: YOUTUBE_CONTENT_TYPE,
      videoId: "youtube-123",
      sourceLanguage: "en",
      translationLanguages: ["de"],
    });
  });

  it("allows anyone to access public Jellyfin content", async () => {
    mockGetCurrentUser.override({
      id: "different-user",
    });

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: JELLYFIN_CONTENT_TYPE,
      title: "Database title",
      source_language: "en",
      jellyfin_id: "jellyfin-123",
      subtitle_tracks: [{ language: "en" }, { language: "de" }],
    });

    mockedFetchJellyfinWatchItem.mockResolvedValue({
      Id: "jellyfin-123",
      Name: "Jellyfin title",
      Type: "Movie",
    });

    mockedGetJellyfinStreamUrl.mockReturnValue("stream-url");

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      id: "mediaId",
      title: "Jellyfin title",
      type: JELLYFIN_CONTENT_TYPE,
      streamUrl: "stream-url",
      sourceLanguage: "en",
      translationLanguages: ["de"],
    });

    expect(mockedFetchJellyfinWatchItem).toHaveBeenCalledWith("jellyfin-123");

    expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("jellyfin-123");
  });

  it("uses the media title if the Jellyfin item has no name", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: JELLYFIN_CONTENT_TYPE,
      title: "Database title",
      source_language: "en",
      jellyfin_id: "jellyfin-123",
      subtitle_tracks: [{ language: "en" }],
    });

    mockedFetchJellyfinWatchItem.mockResolvedValue({
      Id: "jellyfin-123",
      Name: undefined,
      Type: "Movie",
    });

    mockedGetJellyfinStreamUrl.mockReturnValue("stream-url");

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json.title).toBe("Database title");
  });

  it("returns a YouTube watch payload", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: YOUTUBE_CONTENT_TYPE,
      title: "YouTube video",
      source_language: "en",
      youtube_video_id: "youtube-123",
      subtitle_tracks: [{ language: "en" }, { language: "de" }],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      id: "mediaId",
      title: "YouTube video",
      type: YOUTUBE_CONTENT_TYPE,
      videoId: "youtube-123",
      sourceLanguage: "en",
      translationLanguages: ["de"],
    });

    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("excludes the source language from translation languages", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: YOUTUBE_CONTENT_TYPE,
      title: "Video",
      source_language: "en",
      youtube_video_id: "youtube-123",
      subtitle_tracks: [
        { language: "en" },
        { language: "de" },
        { language: "fr" },
        { language: "es" },
      ],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.translationLanguages).toEqual(["de", "fr", "es"]);
  });

  it("returns empty translationLanguages if only the source language exists", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: YOUTUBE_CONTENT_TYPE,
      title: "Video",
      source_language: "en",
      youtube_video_id: "youtube-123",
      subtitle_tracks: [{ language: "en" }],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.translationLanguages).toEqual([]);
  });

  it("returns 400 for unsupported content type", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: "unsupported",
      title: "Unknown content",
      source_language: "en",
      subtitle_tracks: [],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(400);

    expect(json).toEqual({
      error: "Unsupported content type",
    });

    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("returns 400 if Jellyfin content has no jellyfin id", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: JELLYFIN_CONTENT_TYPE,
      title: "Jellyfin video",
      source_language: "en",
      jellyfin_id: null,
      subtitle_tracks: [],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(400);

    expect(json).toEqual({
      error: "Unsupported content type",
    });

    expect(mockedFetchJellyfinWatchItem).not.toHaveBeenCalled();
    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("returns 400 if YouTube content has no video id", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.override({
      user_id: "id",
      type: YOUTUBE_CONTENT_TYPE,
      title: "YouTube video",
      source_language: "en",
      youtube_video_id: null,
      subtitle_tracks: [],
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(400);

    expect(json).toEqual({
      error: "Unsupported content type",
    });
  });

  it("queries media content using the provided media content id", async () => {
    mockGetCurrentUser.base();
    mockDbMediaContent.findUnique.empty();

    const req = new NextRequest("http://localhost");

    await GET(req, mockParams("mediaId23"));

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        id: "mediaId23",
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        type: true,
        source_language: true,
        jellyfin_id: true,
        youtube_video_id: true,
        subtitle_tracks: {
          select: {
            language: true,
          },
        },
      },
    });
  });
});
