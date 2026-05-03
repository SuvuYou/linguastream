import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Watch from "./page";
import { useWatchData, WatchData } from "@/hooks/useWatchData";
import { SubtitleLine, useSubtitleTrack } from "@/hooks/useSubtitleTrack";
import { useSearch } from "@/hooks/useSearch";
import { useStreamUrl } from "@/hooks/useStreamUrl";

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/hooks/useStreamUrl", () => ({
  useStreamUrl: vi.fn(),
}));

vi.mock("@/hooks/useSearch", () => ({
  useSearch: vi.fn(),
}));

vi.mock("@/hooks/useSubtitleTrack", () => ({
  useSubtitleTrack: vi.fn(),
}));

vi.mock("@/hooks/useWatchData", () => ({
  useWatchData: vi.fn(),
}));

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  fetchJellyfinWatchItem: vi.fn(),
  getJellyfinStreamUrl: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { UseQueryResult } from "@tanstack/react-query";
import { SearchResponse } from "@/types/search";
import { useLanguages } from "@/hooks/useLanguages";

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

vi.mock("@/components/features/player/Player", () => ({
  default: ({ streamUrl, title }: { title: string; streamUrl: string }) => (
    <div data-testid="player">
      {streamUrl} - {title}
    </div>
  ),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);
const mockedUseWatchData = vi.mocked(useWatchData);
const mockedUseSubtitleTrack = vi.mocked(useSubtitleTrack);
const mockedUseSearch = vi.mocked(useSearch);
const mockedUseStreamUrl = vi.mocked(useStreamUrl);
const mockedUseLanguages = vi.mocked(useLanguages);

const DEFAULT_LANGUAGE_RESPONSE = {
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: "",
  selectedTranslationLanguage: undefined,
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};

describe("watch content page", () => {
  it("renders Player with fetched data", async () => {
    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
    });

    mockedUseStreamUrl.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { streamUrl: "http://stream-url" },
    } as UseQueryResult<{ streamUrl: string }>);

    mockedUseZodSearchParams.mockReturnValue({
      params: { t: 0 },
      set: vi.fn(),
      remove: vi.fn(),
    });

    mockedUseSearch.mockReturnValue({
      data: {
        results: [
          {
            id: "",
            source_subtitle_line_id: "",
            source_text: "",
            source_language: "",
            translation_language: "",
            translation_text: "",
            start_ms: 1,
            end_ms: 2,
            media_content_id: "",
            media_title: "",
            jellyfin_id: "",
            is_global: false,
            owner_user_id: "",
          },
        ],
      },
    } as UseQueryResult<SearchResponse>);

    mockedUseWatchData.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: "123",
        title: "Movie Title",
        streamUrl: "http://stream-url",
        sourceLanguage: "de",
        translationLanguages: ["en"],
      },
    } as UseQueryResult<WatchData>);

    mockedUseSubtitleTrack.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          index: 1,
          start_ms: 1,
          end_ms: 1,
          text: "subtitle line 1",
        },
      ],
    } as UseQueryResult<SubtitleLine[]>);

    mockedUseWatchData.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        id: "123",
        title: "Movie Title",
        streamUrl: "http://stream-url",
        sourceLanguage: "de",
        translationLanguages: ["en"],
      },
    } as UseQueryResult<WatchData>);

    const Component = await Watch({
      params: Promise.resolve({ mediaContentId: "123" }),
    });

    render(Component);

    expect(screen.getByTestId("player")).toHaveTextContent(
      "http://stream-url - Movie Title",
    );
    // expect(mockedFetchJellyfinWatchItem).toHaveBeenCalledWith("123");
    // expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("123");
  });
});
