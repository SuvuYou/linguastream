import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/initializations/db";
import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { JELLYFIN_CONTENT_TYPE } from "@/helpers/const";
import { indexAllSubtitleLines } from "./search";

vi.mock("@/lib/initializations/meilisearch", () => ({
  SUBTITLE_INDEX: "subtitles",
  meili: {
    index: vi.fn(),
    createIndex: vi.fn(),
  },
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findMany: vi.fn(),
    },
  },
}));

const mockedIndex = {
  delete: vi.fn(),
  updateSettings: vi.fn(),
  addDocuments: vi.fn(),
};

const mockedMeiliIndex = vi.mocked(meili.index);
const mockedCreateIndex = vi.mocked(meili.createIndex);
const mockedFindMany = vi.mocked(db.mediaContent.findMany);

beforeEach(() => {
  vi.clearAllMocks();

  mockedMeiliIndex.mockReturnValue(mockedIndex as never);
  mockedCreateIndex.mockResolvedValue({} as never);
  mockedIndex.delete.mockResolvedValue({} as never);
  mockedIndex.updateSettings.mockResolvedValue({} as never);
  mockedIndex.addDocuments.mockResolvedValue({} as never);
});

function sourceTrack(
  lines: Array<{
    id: string;
    text: string;
    start_ms: number;
    end_ms: number;
    index?: number;
  }>,
) {
  return {
    id: "source-track",
    language: "de",
    is_source: true,
    subtitle_lines: lines.map((line, index) => ({
      index,
      ...line,
    })),
  };
}

function translationTrack(
  language: string,
  lines: Array<{
    id: string;
    text: string;
    start_ms: number;
    end_ms: number;
    index?: number;
  }>,
) {
  return {
    id: `${language}-track`,
    language,
    is_source: false,
    subtitle_lines: lines.map((line, index) => ({
      index,
      ...line,
    })),
  };
}

function mediaContent(overrides: Record<string, unknown> = {}) {
  return {
    id: "media-1",
    title: "Test Movie",
    jellyfin_id: "jellyfin-1",
    youtube_video_id: null,
    type: JELLYFIN_CONTENT_TYPE,
    user_id: "user-1",
    source_language: "de",
    subtitle_tracks: [
      sourceTrack([
        {
          id: "source-1",
          text: "  Hallo Welt  ",
          start_ms: 1000,
          end_ms: 2000,
        },
      ]),
      translationTrack("en", [
        {
          id: "translation-1",
          text: "Hello world",
          start_ms: 1000,
          end_ms: 2000,
        },
      ]),
    ],
    ...overrides,
  };
}

describe("indexAllSubtitleLines", () => {
  it("recreates the subtitle index", async () => {
    mockedFindMany.mockResolvedValue([]);

    const result = await indexAllSubtitleLines();

    expect(mockedMeiliIndex).toHaveBeenCalledWith(SUBTITLE_INDEX);

    expect(mockedIndex.delete).toHaveBeenCalledOnce();

    expect(mockedCreateIndex).toHaveBeenCalledWith(SUBTITLE_INDEX, {
      primaryKey: "id",
    });

    expect(mockedIndex.updateSettings).toHaveBeenCalledWith({
      searchableAttributes: ["source_text"],
      filterableAttributes: [
        "source_language",
        "translation_language",
        "media_content_id",
        "is_global",
        "owner_user_id",
      ],
      sortableAttributes: ["start_ms"],
    });

    expect(result).toEqual({
      indexed: 0,
      match_tolerance_ms: 1000,
      chunk_size: 1000,
    });
  });

  it("indexes a source line with its matching translation", async () => {
    mockedFindMany
      .mockResolvedValueOnce([mediaContent()] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(1);

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        {
          id: "source-1_en",
          source_subtitle_line_id: "source-1",
          source_text: "Hallo Welt",
          source_language: "de",
          translation_language: "en",
          translation_text: "Hello world",
          start_ms: 1000,
          end_ms: 2000,
          media_content_id: "media-1",
          media_title: "Test Movie",
          jellyfin_id: "jellyfin-1",
          youtube_video_id: "",
          is_global: true,
          owner_user_id: "user-1",
        },
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("trims and normalizes source and translation text", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "   Hallo    schöne   Welt   ",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "  Hello   beautiful ",
                start_ms: 1000,
                end_ms: 1500,
              },
              {
                id: "translation-2",
                text: " world   ",
                start_ms: 1500,
                end_ms: 2000,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          source_text: "Hallo    schöne   Welt",
          translation_text: "Hello beautiful world",
        }),
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("matches translation lines that overlap the source line", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "First",
                start_ms: 500,
                end_ms: 1200,
              },
              {
                id: "translation-2",
                text: "Second",
                start_ms: 1800,
                end_ms: 2500,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          translation_text: "First Second",
        }),
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("matches translation lines within the 1000ms tolerance", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hello",
                start_ms: 5000,
                end_ms: 5500,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Hello translation",
                start_ms: 6000,
                end_ms: 6500,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          translation_text: "Hello translation",
        }),
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("does not match translation lines outside overlap and tolerance", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 1500,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Too late",
                start_ms: 3001,
                end_ms: 3500,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(0);
    expect(mockedIndex.addDocuments).not.toHaveBeenCalled();
  });

  it("creates one document for every translation track", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hallo",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
            translationTrack("en", [
              {
                id: "en-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
            translationTrack("uk", [
              {
                id: "uk-1",
                text: "Привіт",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(2);

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "source-1_en",
          translation_language: "en",
          translation_text: "Hello",
        }),
        expect.objectContaining({
          id: "source-1_uk",
          translation_language: "uk",
          translation_text: "Привіт",
        }),
      ]),
      {
        primaryKey: "id",
      },
    );
  });

  it("indexes multiple source lines", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hallo",
                start_ms: 1000,
                end_ms: 1500,
              },
              {
                id: "source-2",
                text: "Wie geht's?",
                start_ms: 3000,
                end_ms: 3500,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 1500,
              },
              {
                id: "translation-2",
                text: "How are you?",
                start_ms: 3000,
                end_ms: 3500,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(2);

    const documents = mockedIndex.addDocuments.mock.calls[0][0];

    expect(documents).toEqual([
      expect.objectContaining({
        id: "source-1_en",
        source_text: "Hallo",
        translation_text: "Hello",
      }),
      expect.objectContaining({
        id: "source-2_en",
        source_text: "Wie geht's?",
        translation_text: "How are you?",
      }),
    ]);
  });

  it("skips media without a source track", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 2000,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(0);
    expect(mockedIndex.addDocuments).not.toHaveBeenCalled();
  });

  it("skips source lines without a matching translation", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "No translation",
                start_ms: 1000,
                end_ms: 1500,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Far away",
                start_ms: 5000,
                end_ms: 5500,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(0);
    expect(mockedIndex.addDocuments).not.toHaveBeenCalled();
  });

  it("sets is_global for Jellyfin content", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          type: JELLYFIN_CONTENT_TYPE,
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          is_global: true,
        }),
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("sets is_global to false for non-Jellyfin content", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          type: "youtube",
          youtube_video_id: "youtube-1",
          jellyfin_id: null,
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(mockedIndex.addDocuments).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          is_global: false,
          jellyfin_id: "",
          youtube_video_id: "youtube-1",
        }),
      ],
      {
        primaryKey: "id",
      },
    );
  });

  it("paginates through media contents using the last id as cursor", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({ id: "media-1" }),
        mediaContent({ id: "media-2" }),
      ] as never)
      .mockResolvedValueOnce([mediaContent({ id: "media-3" })] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(mockedFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        take: 50,
        orderBy: { id: "asc" },
      }),
    );

    expect(mockedFindMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        take: 50,
        cursor: {
          id: "media-2",
        },
        skip: 1,
        orderBy: { id: "asc" },
      }),
    );

    expect(mockedFindMany).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        take: 50,
        cursor: {
          id: "media-3",
        },
        skip: 1,
        orderBy: { id: "asc" },
      }),
    );

    expect(result.indexed).toBe(3);
  });

  it("uses the expected database filters", async () => {
    mockedFindMany.mockResolvedValue([]);

    await indexAllSubtitleLines();

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          subtitle_tracks: {
            some: {},
          },
          source_language: {
            not: expect.anything(),
          },
        },
      }),
    );
  });

  it("adds documents in chunks", async () => {
    const sourceLines = Array.from({ length: 1001 }, (_, index) => ({
      id: `source-${index}`,
      text: `Source ${index}`,
      start_ms: index * 3000,
      end_ms: index * 3000 + 1000,
    }));

    const translationLines = sourceLines.map((line, index) => ({
      id: `translation-${index}`,
      text: `Translation ${index}`,
      start_ms: line.start_ms,
      end_ms: line.end_ms,
    }));

    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack(sourceLines),
            translationTrack("en", translationLines),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result.indexed).toBe(1001);

    expect(mockedIndex.addDocuments).toHaveBeenCalledTimes(2);

    expect(mockedIndex.addDocuments).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({
          id: "source-0_en",
        }),
      ]),
      {
        primaryKey: "id",
      },
    );

    expect(mockedIndex.addDocuments.mock.calls[0][0]).toHaveLength(1000);

    expect(mockedIndex.addDocuments.mock.calls[1][0]).toHaveLength(1);

    expect(mockedIndex.addDocuments.mock.calls[1][0]).toEqual([
      expect.objectContaining({
        id: "source-1000_en",
      }),
    ]);
  });

  it("does not add documents when there are no matching translations", async () => {
    mockedFindMany
      .mockResolvedValueOnce([
        mediaContent({
          subtitle_tracks: [
            sourceTrack([
              {
                id: "source-1",
                text: "Hello",
                start_ms: 1000,
                end_ms: 1500,
              },
            ]),
            translationTrack("en", [
              {
                id: "translation-1",
                text: "Unrelated",
                start_ms: 10000,
                end_ms: 11000,
              },
            ]),
          ],
        }),
      ] as never)
      .mockResolvedValueOnce([]);

    const result = await indexAllSubtitleLines();

    expect(result).toEqual({
      indexed: 0,
      match_tolerance_ms: 1000,
      chunk_size: 1000,
    });

    expect(mockedIndex.addDocuments).not.toHaveBeenCalled();
  });
});
