import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import OverlayPlayer from "./OverlayPlayer";
import { useSearchOverlay } from "@/hooks/useSearchOverlay";
import { useSearch } from "@/hooks/useSearch";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { useAppStore } from "@/lib/initializations/store";
import { UseQueryResult } from "@tanstack/react-query";
import { SearchResponse } from "@/types/search";

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: () => <div data-testid="language-filter" />,
}));

vi.mock("@/hooks/useSearchOverlay", () => ({
  useSearchOverlay: vi.fn(),
}));

vi.mock("@/hooks/useSearch", () => ({
  useSearch: vi.fn(),
}));

vi.mock("@/hooks/useStreamUrl", () => ({
  useStreamUrl: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/events", () => ({
  default: {
    overlay: {
      onOverlay: vi.fn(() => () => {}),
    },
  },
}));

const mockedUseSearchOverlay = vi.mocked(useSearchOverlay);
const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseSearch = vi.mocked(useSearch);
const mockedUseStreamUrl = vi.mocked(useStreamUrl);

afterEach(() => vi.useRealTimers());

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  mockedUseSearchOverlay.mockReturnValue({
    isOpen: true,
    open: vi.fn(),
    close: vi.fn(),
  });

  mockedUseAppStore.mockReturnValue({
    autoPlay: false,
    setAutoPlay: vi.fn(),
    preferredSourceLanguage: "en",
    preferredTranslationLanguage: "de",
  });

  mockedUseSearch.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      results: [
        {
          id: "1",
          media_title: "Test Movie",
          source_text: "hello world",
          translation_text: "hallo welt",
          start_ms: 0,
          end_ms: 1000,
          media_content_id: "m1",
          translation_language: "de",
          source_subtitle_line_id: "",
          source_language: "",
          jellyfin_id: "",
          is_global: false,
          owner_user_id: "",
        },
      ],
    },
  } as UseQueryResult<SearchResponse>);

  mockedUseStreamUrl.mockReturnValue({
    data: {
      streamUrl: "video.mp4",
    },
    isLoading: false,
  } as UseQueryResult<{ streamUrl: string }>);
});

describe("OverlayPlayer", () => {
  it("renders search input", () => {
    render(<OverlayPlayer />);

    expect(
      screen.getByPlaceholderText(/search word uses/i),
    ).toBeInTheDocument();
  });

  it("shows empty state when no query", () => {
    render(<OverlayPlayer />);

    expect(screen.getByText(/start typing to search/i)).toBeInTheDocument();
  });

  it("shows no results state", async () => {
    mockedUseSearch.mockReturnValue({
      data: { results: [] } as SearchResponse,
      isError: false,
      isLoading: false,
    } as UseQueryResult<SearchResponse>);

    render(<OverlayPlayer />);

    const input = screen.getByPlaceholderText(/search word uses/i);

    fireEvent.change(input, {
      target: { value: "nothing" },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });

  it("toggles autoplay button", () => {
    const setAutoPlay = vi.fn();

    mockedUseAppStore.mockReturnValue({
      autoPlay: false,
      setAutoPlay,
      preferredSourceLanguage: "en",
      preferredTranslationLanguage: "de",
    });

    render(<OverlayPlayer />);

    fireEvent.click(screen.getByTestId("autoplay-toggle"));

    expect(setAutoPlay).toHaveBeenCalledWith(true);
  });

  it("closes overlay on backdrop click", () => {
    const close = vi.fn();

    mockedUseSearchOverlay.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close,
    });

    render(<OverlayPlayer />);

    fireEvent.click(screen.getByTestId("close-button"));

    expect(close).toHaveBeenCalled();
  });

  it("does not close when clicking inside panel", () => {
    const close = vi.fn();

    mockedUseSearchOverlay.mockReturnValue({
      isOpen: true,
      open: vi.fn(),
      close,
    });

    render(<OverlayPlayer />);

    fireEvent.click(screen.getByPlaceholderText(/search word uses/i));

    expect(close).not.toHaveBeenCalled();
  });
});
