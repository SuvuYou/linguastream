import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/initializations/db";
import {
  JELLYFIN_CONTENT_TYPE,
  UNKNOWN_SOURCE_LANGUAGE,
  YOUTUBE_CONTENT_TYPE,
} from "@/helpers/const";
import {
  bulkPopulateMediaContentWithJellyfinItems,
  fetchAllRegisteredJellyfinIds,
  fetchPublicMediaContent,
  fetchUnregisteredMediaContent,
} from "./media";
import type { MediaContent } from "@prisma/client";

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

beforeEach(() => vi.resetAllMocks());

const mockedDb = vi.mocked(db, true);

describe("media lib", () => {
  it("populates media content db with jellyfin items", async () => {
    mockedDb.mediaContent.createMany.mockResolvedValue({ count: 2 });

    await bulkPopulateMediaContentWithJellyfinItems(
      [
        { jellyfin_id: "1", title: "A" },
        { jellyfin_id: "2", title: "B" },
      ],
      "user-1",
    );

    expect(mockedDb.mediaContent.createMany).toHaveBeenCalledWith({
      data: [
        {
          jellyfin_id: "1",
          title: "A",
          type: JELLYFIN_CONTENT_TYPE,
          source_language: UNKNOWN_SOURCE_LANGUAGE,
          user_id: "user-1",
        },
        {
          jellyfin_id: "2",
          title: "B",
          type: JELLYFIN_CONTENT_TYPE,
          source_language: UNKNOWN_SOURCE_LANGUAGE,
          user_id: "user-1",
        },
      ],
      skipDuplicates: true,
    });
  });

  it("returns set of jellyfin ids", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([
      { jellyfin_id: "1", type: JELLYFIN_CONTENT_TYPE },
      { jellyfin_id: null, type: YOUTUBE_CONTENT_TYPE },
      { jellyfin_id: "2", type: JELLYFIN_CONTENT_TYPE },
    ] as MediaContent[]);

    const result = await fetchAllRegisteredJellyfinIds();

    expect(result).toEqual(new Set(["1", "2"]));
  });

  it("fetches public media content", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([
      { id: "1" },
    ] as MediaContent[]);
    mockedDb.mediaContent.count.mockResolvedValue(10);

    const result = await fetchPublicMediaContent({
      page: 0,
      pageSize: 5,
    });

    expect(result).toEqual({
      items: [{ id: "1" }],
      total: 10,
      pageCount: 2,
    });
  });

  it("applies search and filters", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([]);
    mockedDb.mediaContent.count.mockResolvedValue(0);

    await fetchPublicMediaContent({
      searchTerm: "test",
      sourceLanguage: "en",
      translationLanguage: "de",
      page: 1,
      pageSize: 10,
    });

    expect(mockedDb.mediaContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          source_language: "en",
          title: {
            contains: "test",
            mode: "insensitive",
          },
          subtitle_tracks: {
            some: { translation_language: "de" },
          },
        }),
        skip: 10,
        take: 10,
      }),
    );
  });

  it("calculates pageCount correctly", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([]);
    mockedDb.mediaContent.count.mockResolvedValue(21);

    const result = await fetchPublicMediaContent({
      page: 0,
      pageSize: 10,
    });

    expect(result.pageCount).toBe(3);
  });

  it("fetches only unregistered content", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([]);
    mockedDb.mediaContent.count.mockResolvedValue(0);

    await fetchUnregisteredMediaContent({
      page: 0,
      pageSize: 10,
    });

    expect(mockedDb.mediaContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          source_language: UNKNOWN_SOURCE_LANGUAGE,
        }),
      }),
    );
  });

  it("applies search filter for unregistered", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([]);
    mockedDb.mediaContent.count.mockResolvedValue(0);

    await fetchUnregisteredMediaContent({
      searchTerm: "abc",
      page: 0,
      pageSize: 10,
    });

    expect(mockedDb.mediaContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: {
            contains: "abc",
            mode: "insensitive",
          },
        }),
      }),
    );
  });
});
