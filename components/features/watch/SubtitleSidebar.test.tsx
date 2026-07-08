import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SubtitleSidebar from "./SubtitleSidebar";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

const subtitleListMock = vi.fn();

vi.mock("./SubtitleList", () => ({
  default: (props: any) => {
    subtitleListMock(props);

    return (
      <div data-testid="subtitle-list">
        {props.filteredSubtitlePairs.map((pair: any) => (
          <div key={pair.index}>
            {pair.source?.text}
            {pair.translation?.text}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <div>{children}</div>,
  SidebarHeader: ({ children }: any) => <div>{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarInput: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <div>{children}</div>,
}));

const mockedUseAppStore = vi.mocked(useAppStore);

const settings = {
  showSource: true,
  showTranslation: true,
};

const sourceLines = [
  {
    index: 0,
    start_ms: 0,
    end_ms: 1000,
    text: "hello world",
  },
  {
    index: 1,
    start_ms: 2000,
    end_ms: 3000,
    text: "second line",
  },
];

const translationLines = [
  {
    index: 0,
    start_ms: 0,
    end_ms: 1000,
    text: "hallo welt",
  },
];

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: settings,
  } as never);
});

describe("SubtitleSidebar", () => {
  it("renders search input", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    expect(
      screen.getByPlaceholderText(/search subtitles/i),
    ).toBeInTheDocument();
  });

  it("shows total line count initially", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    expect(screen.getByText("2 lines")).toBeInTheDocument();
  });

  it("filters subtitle pairs by query", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search subtitles/i), {
      target: { value: "hello" },
    });

    expect(screen.getByText("1 result")).toBeInTheDocument();

    expect(screen.getByText(/hello world/i)).toBeInTheDocument();

    expect(screen.queryByText(/second line/i)).not.toBeInTheDocument();
  });

  it("shows zero results when nothing matches", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search subtitles/i), {
      target: { value: "zzz" },
    });

    expect(screen.getByText("0 results")).toBeInTheDocument();
  });

  it("passes current time to SubtitleList", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={1234}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    expect(subtitleListMock).toHaveBeenCalled();

    expect(subtitleListMock.mock.calls.at(-1)?.[0].currentTimeMs).toBe(1234);
  });

  it("passes visibility flags from settings", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    const props = subtitleListMock.mock.calls.at(-1)?.[0];

    expect(props.shouldShowSourceLine).toBe(true);
    expect(props.shouldShowTranslationLine).toBe(true);
  });

  it("respects hidden source setting", () => {
    mockedUseAppStore.mockReturnValue({
      subtitleSettings: {
        showSource: false,
        showTranslation: true,
      },
    } as never);

    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={sourceLines}
        translationLines={translationLines}
      />,
    );

    const props = subtitleListMock.mock.calls.at(-1)?.[0];

    expect(props.shouldShowSourceLine).toBe(false);
    expect(props.shouldShowTranslationLine).toBe(true);
  });

  it("handles empty subtitle arrays", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={0}
        sourceLines={[]}
        translationLines={[]}
      />,
    );

    expect(screen.getByText("0 lines")).toBeInTheDocument();

    const props = subtitleListMock.mock.calls.at(-1)?.[0];

    expect(props.subtitlePairs).toEqual([]);
    expect(props.filteredSubtitlePairs).toEqual([]);
  });
});
