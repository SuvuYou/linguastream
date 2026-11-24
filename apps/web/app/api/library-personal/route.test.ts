import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { User } from "@prisma/client";

import { GET } from "./route";
import { db } from "@/lib/initializations/db";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  YOUTUBE_CONTENT_TYPE,
  UPLOAD_CONTENT_TYPE,
  PAGE_SIZE,
} from "@/helpers/const";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedFindMany = vi.mocked(db.mediaContent.findMany);
const mockedCount = vi.mocked(db.mediaContent.count);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET api/library", () => {
  it("returns 401 if not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });

    expect(mockedFindMany).not.toHaveBeenCalled();
    expect(mockedCount).not.toHaveBeenCalled();
  });

  it("fetches user's YouTube and uploaded media by default", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([
      {
        id: "media-1",
        title: "YouTube video",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "en",
        youtube_video_id: "abc123",
        file_path: null,
        job_status: "completed",
        job_progress: 100,
        subtitle_tracks: [{ language: "en" }],
      },
    ]);

    mockedCount.mockResolvedValue(1);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(mockedFindMany).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        type: {
          in: [YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE],
        },
      },
      take: PAGE_SIZE,
      skip: 0,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        source_language: true,
        youtube_video_id: true,
        file_path: true,
        job_status: true,
        job_progress: true,
        subtitle_tracks: {
          select: {
            language: true,
          },
        },
      },
    });

    expect(mockedCount).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        type: {
          in: [YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE],
        },
      },
    });

    expect(json).toEqual({
      items: [
        {
          id: "media-1",
          title: "YouTube video",
          type: YOUTUBE_CONTENT_TYPE,
          source_language: "en",
          youtube_video_id: "abc123",
          file_path: null,
          job_status: "completed",
          job_progress: 100,
          subtitle_tracks: [{ language: "en" }],
          thumbnailUrl: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
        },
      ],
      total: 1,
      pageCount: Math.ceil(1 / PAGE_SIZE),
    });
  });

  it("filters by type when type is provided", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    const req = new NextRequest(`http://localhost?type=${UPLOAD_CONTENT_TYPE}`);

    await GET(req);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: "user-1",
          type: {
            equals: UPLOAD_CONTENT_TYPE,
          },
        },
      }),
    );

    expect(mockedCount).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        type: {
          equals: UPLOAD_CONTENT_TYPE,
        },
      },
    });
  });

  it("filters by source language", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    const req = new NextRequest("http://localhost?src=de");

    await GET(req);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: "user-1",
          type: {
            in: [YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE],
          },
          source_language: "de",
        },
      }),
    );

    expect(mockedCount).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        type: {
          in: [YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE],
        },
        source_language: "de",
      },
    });
  });

  it("filters by title search query", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    const req = new NextRequest("http://localhost?q=Harry&type=youtube&src=en");

    await GET(req);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: "user-1",
          type: {
            equals: "youtube",
          },
          source_language: "en",
          title: {
            contains: "Harry",
            mode: "insensitive",
          },
        },
      }),
    );

    expect(mockedCount).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        type: {
          equals: "youtube",
        },
        source_language: "en",
        title: {
          contains: "Harry",
          mode: "insensitive",
        },
      },
    });
  });

  it("applies pagination", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(PAGE_SIZE * 2 + 1);

    const page = 2;

    const req = new NextRequest(`http://localhost?page=${page}`);
    const res = await GET(req);
    const json = await res.json();

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      }),
    );

    expect(json.total).toBe(PAGE_SIZE * 2 + 1);
    expect(json.pageCount).toBe(3);
  });

  it("generates thumbnail URL for YouTube content with video ID", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([
      {
        id: "youtube-1",
        title: "Test video",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "en",
        youtube_video_id: "dQw4w9WgXcQ",
        file_path: null,
        job_status: "completed",
        job_progress: 100,
        subtitle_tracks: [],
      },
    ]);

    mockedCount.mockResolvedValue(1);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(json.items[0].thumbnailUrl).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    );
  });

  it("returns null thumbnail for uploaded content", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([
      {
        id: "upload-1",
        title: "Uploaded video",
        type: UPLOAD_CONTENT_TYPE,
        source_language: "de",
        youtube_video_id: null,
        file_path: "/uploads/video.mp4",
        job_status: "completed",
        job_progress: 100,
        subtitle_tracks: [],
      },
    ]);

    mockedCount.mockResolvedValue(1);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(json.items[0].thumbnailUrl).toBeNull();
  });

  it("returns null thumbnail for YouTube content without video ID", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([
      {
        id: "youtube-1",
        title: "YouTube video",
        type: YOUTUBE_CONTENT_TYPE,
        source_language: "en",
        youtube_video_id: null,
        file_path: null,
        job_status: "processing",
        job_progress: 50,
        subtitle_tracks: [],
      },
    ]);

    mockedCount.mockResolvedValue(1);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(json.items[0].thumbnailUrl).toBeNull();
  });

  it("returns empty items and zero page count when there are no results", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(json).toEqual({
      items: [],
      total: 0,
      pageCount: 0,
    });
  });

  it("returns correct page count when total is not divisible by page size", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
    } as User);

    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(PAGE_SIZE + 1);

    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    const json = await res.json();

    expect(json.total).toBe(PAGE_SIZE + 1);
    expect(json.pageCount).toBe(2);
  });
});
