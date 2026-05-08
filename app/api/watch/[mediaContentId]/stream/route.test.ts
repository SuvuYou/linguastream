import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { getJellyfinStreamUrl } from "@/lib/db-helpers/jellyfin";
import { db } from "@/lib/initializations/db";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";
import { UPLOAD_CONTENT_TYPE } from "@/helpers/const";

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
  getJellyfinStreamUrl: vi.fn(),
}));

const mockedGetJellyfinStreamUrl = vi.mocked(getJellyfinStreamUrl);

function mockParams(mediaContentId = "media-1") {
  return {
    params: Promise.resolve({ mediaContentId }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/media/[mediaContentId]/stream", () => {
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

  it("returns 404 if media content does not exist", async () => {
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

  it("returns 403 if media is private and user is not owner", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    mockDbMediaContent.findUnique.override({
      user_id: "other",
      type: UPLOAD_CONTENT_TYPE,
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(403);

    expect(json).toEqual({
      error: "Forbidden",
    });

    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("allows owner to access private media", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    mockDbMediaContent.findUnique.override({ user_id: "user-1" });

    mockedGetJellyfinStreamUrl.mockReturnValue("http://stream.example/jf-1");

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      streamUrl: "http://stream.example/jf-1",
    });

    expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("jellyfinId");
  });

  it("allows public jellyfin media for non-owner", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    mockDbMediaContent.findUnique.override({ user_id: "other" });

    mockedGetJellyfinStreamUrl.mockReturnValue("http://stream.example/jf-1");

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      streamUrl: "http://stream.example/jf-1",
    });

    expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("jellyfinId");
  });

  it("returns 400 if jellyfin_id is missing", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    mockDbMediaContent.findUnique.override({
      user_id: "user-1",
      jellyfin_id: null,
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(400);

    expect(json).toEqual({
      error: "No stream available",
    });

    expect(mockedGetJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("queries media with correct select shape", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.base();

    mockedGetJellyfinStreamUrl.mockReturnValue("stream-url");

    const req = new NextRequest("http://localhost");

    await GET(req, mockParams("media-123"));

    expect(db.mediaContent.findUnique).toHaveBeenCalledWith({
      where: {
        id: "media-123",
      },
      select: {
        user_id: true,
        jellyfin_id: true,
        type: true,
      },
    });
  });
});
