import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/initializations/db";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "./languages";
import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import type { MediaContent, SubtitleTrack } from "@prisma/client";

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findMany: vi.fn(),
    },
    subtitleTrack: {
      findMany: vi.fn(),
    },
  },
}));

beforeEach(() => vi.resetAllMocks());

const mockedDb = vi.mocked(db, true);

describe("languages lib", () => {
  it("returns empty array when no languages", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([]);

    const result = await fetchAvailableSourceLanguages();

    expect(result).toEqual([]);
    expect(mockedDb.mediaContent.findMany).toHaveBeenCalled();
  });

  it("filters out null and UNKNOWN_SOURCE_LANGUAGE", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([
      { source_language: "en" },
      { source_language: null },
      { source_language: UNKNOWN_SOURCE_LANGUAGE },
      { source_language: "de" },
    ] as MediaContent[]);

    const result = await fetchAvailableSourceLanguages();

    expect(result).toEqual(["en", "de"]);
  });

  it("returns valid source languages", async () => {
    mockedDb.mediaContent.findMany.mockResolvedValue([
      { source_language: "en" },
      { source_language: "de" },
    ] as MediaContent[]);

    const result = await fetchAvailableSourceLanguages();

    expect(result).toEqual(["en", "de"]);
  });

  it("returns subtitle languages", async () => {
    mockedDb.subtitleTrack.findMany.mockResolvedValue([
      { subtitle_language: "en" },
      { subtitle_language: "es" },
    ] as SubtitleTrack[]);

    const result = await fetchAvailableSubtitleLanguages();

    expect(result).toEqual(["en", "es"]);
  });

  it("returns empty array when no subtitle languages", async () => {
    mockedDb.subtitleTrack.findMany.mockResolvedValue([]);

    const result = await fetchAvailableSubtitleLanguages();

    expect(result).toEqual([]);
  });
});
