import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SidebarSubtitleSection from "./SidebarSubtitleSection";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("./SubtitleList", () => ({
  default: ({
    filteredSubtitlePairs,
    shouldShowSourceLine,
    shouldShowTranslationLine,
    isLoading,
  }: {
    filteredSubtitlePairs: any[];
    shouldShowSourceLine: boolean;
    shouldShowTranslationLine: boolean;
    isLoading: boolean;
  }) => (
    <div data-testid="subtitle-list">
      {isLoading && "Loading"}
      {shouldShowSourceLine && "Source"}
      {shouldShowTranslationLine && "Translation"}
      {filteredSubtitlePairs.map((pair) => (
        <div key={pair.index}>
          {pair.source?.text}
          {pair.translation?.text}
        </div>
      ))}
    </div>
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);

const sourceLines = [
  { index: 0, start_ms: 0, end_ms: 1000, text: "Hello world" },
  { index: 1, start_ms: 1000, end_ms: 2000, text: "Good morning" },
] as any;

const translationLines = [
  { index: 0, start_ms: 0, end_ms: 1000, text: "Hallo Welt" },
  { index: 1, start_ms: 1000, end_ms: 2000, text: "Guten Morgen" },
] as any;

const baseProps = {
  currentTimeMs: 500,
  sourceLines,
  translationLines,
  isLoading: false,
};

describe("SidebarSubtitleSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAppStore.mockReturnValue({
      subtitleSettings: {
        showSource: true,
        showTranslation: true,
      },
    } as any);
  });

  it("shows line count", () => {
    render(<SidebarSubtitleSection {...baseProps} />);

    expect(screen.getByText("2 lines")).toBeInTheDocument();
  });

  it("search is case insensitive", async () => {
    const user = userEvent.setup();

    render(<SidebarSubtitleSection {...baseProps} />);

    await user.type(
      screen.getByPlaceholderText("Search subtitles..."),
      "HELLO",
    );

    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("shows zero results", async () => {
    const user = userEvent.setup();

    render(<SidebarSubtitleSection {...baseProps} />);

    await user.type(
      screen.getByPlaceholderText("Search subtitles..."),
      "missing",
    );

    expect(screen.getByText("0 results")).toBeInTheDocument();
  });

  it("only searches source when translation is hidden", async () => {
    const user = userEvent.setup();

    mockedUseAppStore.mockReturnValue({
      subtitleSettings: {
        showSource: true,
        showTranslation: false,
      },
    } as any);

    render(<SidebarSubtitleSection {...baseProps} />);

    await user.type(
      screen.getByPlaceholderText("Search subtitles..."),
      "hallo",
    );

    expect(screen.getByText("0 results")).toBeInTheDocument();
  });

  it("only searches translation when source is hidden", async () => {
    const user = userEvent.setup();

    mockedUseAppStore.mockReturnValue({
      subtitleSettings: {
        showSource: false,
        showTranslation: true,
      },
    } as any);

    render(<SidebarSubtitleSection {...baseProps} />);

    await user.type(
      screen.getByPlaceholderText("Search subtitles..."),
      "hallo",
    );

    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("handles empty subtitle lists", () => {
    render(
      <SidebarSubtitleSection
        {...baseProps}
        sourceLines={[]}
        translationLines={[]}
      />,
    );

    expect(screen.getByText("0 lines")).toBeInTheDocument();
  });

  it("passes loading state to SubtitleList", () => {
    render(<SidebarSubtitleSection {...baseProps} isLoading />);

    expect(screen.getByTestId("subtitle-list")).toHaveTextContent("Loading");
  });
});
