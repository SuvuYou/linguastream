import { GET } from "./route";

import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  fetchJellyfinLibrary,
  getThumbnailUrl,
} from "@/lib/db-helpers/jellyfin";
import {
  fetchPublicMediaContent,
  fetchUnregisteredMediaContent,
} from "@/lib/db-helpers/media";
import { beforeEach, expect, it, vi } from "vitest";
import { describe } from "node:test";
import { parseSearchParamsSafe } from "@/helpers/params-schema";
import { NextRequest } from "next/server";
import type { MediaContent, User } from "@prisma/client";
import type { JellyfinItem } from "@/types";

vi.mock("@/lib/initializations/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  fetchJellyfinLibrary: vi.fn(),
  getThumbnailUrl: vi.fn(),
}));

vi.mock("@/lib/db-helpers/media", () => ({
  fetchPublicMediaContent: vi.fn(),
  fetchUnregisteredMediaContent: vi.fn(),
}));

vi.mock("@/helpers/params-schema", () => ({
  parseSearchParamsSafe: vi.fn(),
  FETCH_LIBRARY_API_PARAMS_SCHEMA: {},
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const mockedFetchJellyfinLibrary = vi.mocked(fetchJellyfinLibrary);
const mockedGetThumbnailUrl = vi.mocked(getThumbnailUrl);

const mockedFetchPublicMediaContent = vi.mocked(fetchPublicMediaContent);
const mockedFetchUnregisteredMediaContent = vi.mocked(
  fetchUnregisteredMediaContent,
);

const mockedParseSearchParams = vi.mocked(parseSearchParamsSafe);

beforeEach(() => vi.resetAllMocks());

describe("GET api/library", () => {
  it("return 401 if not authintificated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = new Request("http://localhost");

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });

    expect(mockedFetchJellyfinLibrary).not.toHaveBeenCalled();
    expect(mockedGetThumbnailUrl).not.toHaveBeenCalled();
    expect(mockedFetchPublicMediaContent).not.toHaveBeenCalled();
    expect(mockedFetchUnregisteredMediaContent).not.toHaveBeenCalled();
  });

  it("fetches public media content for normal user", async () => {
    mockedGetCurrentUser.mockResolvedValue({ is_admin: false } as User);

    mockedParseSearchParams.mockReturnValue({
      q: "test",
      selectedSrc: "en",
      unreg: false,
      page: 0,
    });

    mockedFetchPublicMediaContent.mockResolvedValue({
      items: [{ jellyfin_id: "1", title: "Movie" }] as MediaContent[],
      total: 1,
      pageCount: 1,
    });

    mockedFetchJellyfinLibrary.mockResolvedValue([
      { Id: "1", Name: "Movie Jellyfin" } as JellyfinItem,
    ]);

    mockedGetThumbnailUrl.mockReturnValue("thumb-url");

    const req = new NextRequest("http://localhost?unreg=true&page=0");
    const res = await GET(req);
    const json = await res.json();

    expect(mockedFetchPublicMediaContent).toHaveBeenCalled();
    expect(mockedFetchUnregisteredMediaContent).not.toHaveBeenCalled();

    expect(json.items[0]).toMatchObject({
      title: "Movie",
      thumbnailUrl: "thumb-url",
    });
  });

  it("fetches unregistered content for admin when flag is set", async () => {
    mockedGetCurrentUser.mockResolvedValue({ is_admin: true } as User);

    mockedParseSearchParams.mockReturnValue({
      q: "",
      selectedSrc: undefined,
      unreg: true,
      page: 0,
    });

    mockedFetchUnregisteredMediaContent.mockResolvedValue({
      items: [],
      total: 0,
      pageCount: 0,
    });

    const req = new NextRequest("http://localhost?unreg=true&page=0");
    await GET(req);

    expect(mockedFetchUnregisteredMediaContent).toHaveBeenCalled();
    expect(mockedFetchPublicMediaContent).not.toHaveBeenCalled();
  });

  it("does not call jellyfin if no ids", async () => {
    mockedGetCurrentUser.mockResolvedValue({ is_admin: false } as User);

    mockedParseSearchParams.mockReturnValue({
      q: "",
      selectedSrc: undefined,
      unreg: false,
      page: 0,
    });

    mockedFetchPublicMediaContent.mockResolvedValue({
      items: [{ jellyfin_id: null }] as MediaContent[],
      total: 1,
      pageCount: 1,
    });

    const req = new NextRequest("http://localhost?unreg=true&page=0");
    await GET(req);

    expect(mockedFetchJellyfinLibrary).not.toHaveBeenCalled();
  });

  it("merges db items with jellyfin data", async () => {
    mockedGetCurrentUser.mockResolvedValue({ is_admin: false } as User);

    mockedParseSearchParams.mockReturnValue({
      q: "",
      selectedSrc: undefined,
      unreg: false,
      page: 0,
    });

    mockedFetchPublicMediaContent.mockResolvedValue({
      items: [{ jellyfin_id: "1", title: "DB Movie" }] as MediaContent[],
      total: 1,
      pageCount: 1,
    });

    mockedFetchJellyfinLibrary.mockResolvedValue([
      { Id: "1", Name: "Jellyfin Movie" } as JellyfinItem,
    ]);

    mockedGetThumbnailUrl.mockReturnValue("thumb-url");

    const req = new NextRequest("http://localhost?unreg=true&page=0");
    const res = await GET(req);
    const json = await res.json();

    expect(json.items[0].jellyfinItem).toEqual({
      Id: "1",
      Name: "Jellyfin Movie",
    });
  });
});
