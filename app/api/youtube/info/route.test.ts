import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import {
  YOUTUBE_CONTENT_TYPE,
  SUBTITLE_ACQUISITION_METHODS,
} from "@/helpers/const";
import type { User } from "@prisma/client";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedFindFirst = vi.mocked(db.mediaContent.findFirst);
const mockedCreate = vi.mocked(db.mediaContent.create);

const mockUser = {
  id: "user-1",
} as User;

const createRequest = (body: unknown) =>
  new NextRequest("http://localhost", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

const mockFetch = (response: { ok: boolean; json: () => Promise<unknown> }) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe("POST api/...", () => {
  it("returns 401 if not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 if url is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);

    const req = createRequest({
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Missing url" });

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 if source language is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Missing source language" });

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid URL", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);

    const req = createRequest({
      url: "https://example.com/video/123",
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Invalid YouTube URL" });

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed URL", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);

    const req = createRequest({
      url: "not-a-valid-url",
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Invalid YouTube URL" });

    expect(mockedFindFirst).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 409 if the video already exists in the user's library", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);

    mockedFindFirst.mockResolvedValue({
      id: "existing-media",
      youtube_video_id: "dQw4w9WgXcQ",
      user_id: "user-1",
    } as never);

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json).toEqual({
      error: "This video is already in your library",
    });

    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        youtube_video_id: "dQw4w9WgXcQ",
        user_id: "user-1",
      },
    });

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 if YouTube oEmbed request fails", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);
    mockedFindFirst.mockResolvedValue(null);

    mockFetch({
      ok: false,
      json: vi.fn(),
    });

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceLang: "de",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: "Could not fetch video info. Check the URL and try again.",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
    );

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("creates media content for a youtube.com URL", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);
    mockedFindFirst.mockResolvedValue(null);

    mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({
        title: "Never Gonna Give You Up",
      }),
    });

    mockedCreate.mockResolvedValue({
      id: "media-1",
      title: "Never Gonna Give You Up",
    } as never);

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceLang: "en",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      id: "media-1",
      title: "Never Gonna Give You Up",
      videoId: "dQw4w9WgXcQ",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    });

    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        youtube_video_id: "dQw4w9WgXcQ",
        user_id: "user-1",
      },
    });

    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        user_id: "user-1",
        title: "Never Gonna Give You Up",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "en",
        source_subtitle_acquisition_method:
          SUBTITLE_ACQUISITION_METHODS.YOUTUBE,
        youtube_video_id: "dQw4w9WgXcQ",
      },
    });
  });

  it("creates media content for a youtu.be URL", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);
    mockedFindFirst.mockResolvedValue(null);

    mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({
        title: "Test Video",
      }),
    });

    mockedCreate.mockResolvedValue({
      id: "media-2",
      title: "Test Video",
    } as never);

    const req = createRequest({
      url: "https://youtu.be/abc123",
      sourceLang: "de",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      id: "media-2",
      title: "Test Video",
      videoId: "abc123",
      thumbnailUrl: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
    });

    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        youtube_video_id: "abc123",
        user_id: "user-1",
      },
    });

    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        user_id: "user-1",
        title: "Test Video",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "de",
        source_subtitle_acquisition_method:
          SUBTITLE_ACQUISITION_METHODS.YOUTUBE,
        youtube_video_id: "abc123",
      },
    });
  });

  it("uses the video title returned by oEmbed", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);
    mockedFindFirst.mockResolvedValue(null);

    mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({
        title: "A Very Specific Video Title",
        author_name: "Some Channel",
        author_url: "https://youtube.com/@channel",
      }),
    });

    mockedCreate.mockResolvedValue({
      id: "media-3",
    } as never);

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=video123",
      sourceLang: "fr",
    });

    await POST(req);

    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        user_id: "user-1",
        title: "A Very Specific Video Title",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "fr",
        source_subtitle_acquisition_method:
          SUBTITLE_ACQUISITION_METHODS.YOUTUBE,
        youtube_video_id: "video123",
      },
    });
  });

  it("checks for an existing video before fetching oEmbed", async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser);
    mockedFindFirst.mockResolvedValue({
      id: "existing-media",
    } as never);

    mockFetch({
      ok: true,
      json: vi.fn().mockResolvedValue({
        title: "Should Not Be Fetched",
      }),
    });

    const req = createRequest({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceLang: "en",
    });

    const res = await POST(req);

    expect(res.status).toBe(409);
    expect(fetch).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
