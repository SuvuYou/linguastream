import { beforeEach, describe, expect, it, vi } from "vitest";
import { meili } from "@/lib/initializations/meilisearch";
import { indexAllSubtitleLines, SubtitleSearchDocument } from "./search";
import { Index } from "meilisearch";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";
import { db } from "../initializations/db";
import { JELLYFIN_CONTENT_TYPE } from "@/helpers/const";
import { MergedContentItem } from "@/types";

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/initializations/meilisearch", () => ({
  meili: {
    index: vi.fn(),
  },
  SUBTITLE_INDEX: "subtitles",
}));

beforeEach(() => vi.resetAllMocks());

const mockedDb = vi.mocked(db, true);
const mockedMeili = vi.mocked(meili, true);

describe("indexAllSubtitleLines", () => {
  it("configures meilisearch index", async () => {
    const updateSettings = vi.fn();
    const addDocuments = vi.fn().mockResolvedValue(undefined);

    mockedMeili.index.mockReturnValue({
      updateSettings,
      addDocuments,
    } as unknown as Index<SubtitleSearchDocument>);

    mockDbMediaContent.findMany.empty();

    const result = await indexAllSubtitleLines();

    expect(updateSettings).toHaveBeenCalledWith({
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

  it("skips when no media content exists", async () => {
    const updateSettings = vi.fn();
    const addDocuments = vi.fn();

    mockedMeili.index.mockReturnValue({
      updateSettings,
      addDocuments,
    } as unknown as Index<SubtitleSearchDocument>);

    mockDbMediaContent.findMany.empty();

    const result = await indexAllSubtitleLines();

    expect(addDocuments).not.toHaveBeenCalled();
    expect(result.indexed).toBe(0);
  });

  it("creates subtitle search documents from matching lines", async () => {
    const updateSettings = vi.fn();
    const addDocuments = vi.fn().mockResolvedValue(undefined);

    mockedMeili.index.mockReturnValue({
      updateSettings,
      addDocuments,
    } as unknown as Index<SubtitleSearchDocument>);

    mockedDb.mediaContent.findMany
      .mockResolvedValueOnce([
        {
          id: "m1",
          title: "Movie",
          jellyfin_id: "j1",
          type: JELLYFIN_CONTENT_TYPE,
          user_id: "u1",
          source_language: "en",
          subtitle_tracks: [
            {
              is_source: true,
              language: "en",
              subtitle_lines: [
                {
                  id: "s1",
                  text: "hello",
                  start_ms: 0,
                  end_ms: 1000,
                  index: 0,
                },
              ],
            },
            {
              is_source: false,
              language: "de",
              subtitle_lines: [
                {
                  id: "t1",
                  text: "hallo",
                  start_ms: 0,
                  end_ms: 1000,
                  index: 0,
                },
              ],
            },
          ],
        },
      ] as unknown as MergedContentItem[])
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(addDocuments).toHaveBeenCalled();

    const docs = addDocuments.mock.calls[0][0];

    expect(docs[0]).toEqual(
      expect.objectContaining({
        id: "s1_de",
        source_text: "hello",
        translation_text: "hallo",
        media_content_id: "m1",
        media_title: "Movie",
        jellyfin_id: "j1",
        is_global: true,
      }),
    );
  });

  it("chunks documents before sending to meilisearch", async () => {
    const updateSettings = vi.fn();
    const addDocuments = vi.fn().mockResolvedValue(undefined);

    mockedMeili.index.mockReturnValue({
      updateSettings,
      addDocuments,
    } as unknown as Index<SubtitleSearchDocument>);

    const sourceLines = Array.from({ length: 1200 }, (_, i) => ({
      id: `s${i}`,
      text: "hello",
      start_ms: 0,
      end_ms: 1000,
      index: i,
    }));

    mockedDb.mediaContent.findMany
      .mockResolvedValueOnce([
        {
          id: "m1",
          title: "Movie",
          jellyfin_id: "j1",
          type: JELLYFIN_CONTENT_TYPE,
          user_id: "u1",
          source_language: "en",
          subtitle_tracks: [
            {
              is_source: true,
              language: "en",
              subtitle_lines: sourceLines,
            },
            {
              is_source: false,
              language: "de",
              subtitle_lines: sourceLines,
            },
          ],
        },
      ] as unknown as MergedContentItem[])
      .mockResolvedValueOnce([]);

    await indexAllSubtitleLines();

    expect(addDocuments).toHaveBeenCalledTimes(2);
  });

  it("skips media without source track", async () => {
    const updateSettings = vi.fn();
    const addDocuments = vi.fn();

    mockedMeili.index.mockReturnValue({
      updateSettings,
      addDocuments,
    } as unknown as Index<SubtitleSearchDocument>);

    mockDbMediaContent.findMany.once({
      subtitle_tracks: [
        {
          is_source: false,
          language: "de",
          subtitle_lines: [
            {
              id: "t1",
              text: "hallo",
              start_ms: 0,
              end_ms: 1000,
              index: 0,
            },
          ],
        },
      ],
    } as unknown as MergedContentItem);

    await indexAllSubtitleLines();

    expect(addDocuments).not.toHaveBeenCalled();
  });
});
