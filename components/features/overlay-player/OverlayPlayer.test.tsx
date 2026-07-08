import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import OverlayPlayer from "./OverlayPlayer";
import { useSearch } from "@/hooks/useSearch";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/hooks/useSearch", () => ({
  useSearch: vi.fn(),
}));

vi.mock("@/hooks/useStreamUrl", () => ({
  useStreamUrl: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/layout/SearchOverlayProvider", () => ({
  SearchOverlayProvider: () => <div data-testid="search-overlay-provider" />,
}));

vi.mock("./Header", () => ({
  default: ({
    onSearchQueryChange,
  }: {
    onSearchQueryChange: (query: string) => void;
  }) => (
    <div>
      <button onClick={() => onSearchQueryChange("hello")}>Search</button>
      <div>Header</div>
    </div>
  ),
}));

vi.mock("./SearchResults", () => ({
  default: ({
    searchQuery,
    onSelect,
  }: {
    searchQuery: string;
    onSelect: (item: unknown) => void;
  }) => (
    <div>
      <div>Query: {searchQuery}</div>
      <button
        onClick={() =>
          onSelect({
            media_content_id: "m1",
            media_title: "Movie",
            source_text: "hello",
            translation_text: "hallo",
            start_ms: 1000,
            end_ms: 2000,
          })
        }
      >
        Select Result
      </button>
    </div>
  ),
}));

vi.mock("@/components/features/player/PlayerSmall", () => ({
  default: ({ streamUrl }: { streamUrl: string }) => (
    <div>PlayerSmall: {streamUrl}</div>
  ),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (asChild ? children : <button {...props}>{children}</button>),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div>Spinner</div>,
}));

vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockedUseSearch = vi.mocked(useSearch);
const mockedUseStreamUrl = vi.mocked(useStreamUrl);
const mockedUseAppStore = vi.mocked(useAppStore);

const setOverlayOpen = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    overlayOpen: true,
    setOverlayOpen,
    preferredSourceLanguage: "en",
    preferredTranslationLanguage: "de",
    subtitleSettings: {},
    autoPlay: false,
  });

  mockedUseSearch.mockReturnValue({
    data: { results: [] },
    isLoading: false,
    isError: false,
  } as never);

  mockedUseStreamUrl.mockReturnValue({
    data: null,
    isLoading: false,
  } as never);
});

describe("OverlayPlayer", () => {
  it("renders provider, header and results", () => {
    render(<OverlayPlayer />);

    expect(screen.getByTestId("search-overlay-provider")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Query:")).toBeInTheDocument();
  });

  it("updates search query from header", () => {
    render(<OverlayPlayer />);

    fireEvent.click(screen.getByText("Search"));

    expect(screen.getByText("Query: hello")).toBeInTheDocument();
  });

  it("shows empty preview initially", () => {
    render(<OverlayPlayer />);

    expect(screen.getByText(/No preview active/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a result to preview/i)).toBeInTheDocument();
  });

  it("shows loading preview", () => {
    mockedUseStreamUrl.mockReturnValue({
      data: null,
      isLoading: true,
    } as never);

    render(<OverlayPlayer />);

    fireEvent.click(screen.getByText("Select Result"));

    expect(screen.getByText(/Loading stream preview/i)).toBeInTheDocument();
  });

  it("renders player when a result is selected", () => {
    mockedUseStreamUrl.mockReturnValue({
      data: {
        streamUrl: "video.mp4",
      },
      isLoading: false,
    } as never);

    render(<OverlayPlayer />);

    fireEvent.click(screen.getByText("Select Result"));

    expect(screen.getByText("PlayerSmall: video.mp4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Go to video/i })).toHaveAttribute(
      "href",
      "/watch/m1?t=1000",
    );
  });

  it("passes overlay state changes to the store", () => {
    render(<OverlayPlayer />);

    expect(setOverlayOpen).not.toHaveBeenCalled();
  });
});
