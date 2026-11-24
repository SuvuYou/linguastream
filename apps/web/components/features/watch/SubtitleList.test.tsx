import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SubtitleList from "./SubtitleList";

vi.mock("./SubtitleListSkeleton", () => ({
  default: () => <div>Loading subtitles...</div>,
}));

vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
}));

vi.mock("@/components/features/watch/SubtitleRow", () => ({
  default: ({
    subtitlePair,
    isActive,
    query,
  }: {
    subtitlePair: any;
    isActive: boolean;
    query: string;
  }) => (
    <tr data-testid={`subtitle-row-${subtitlePair.index}`}>
      <td>
        {subtitlePair.source?.text}
        {subtitlePair.translation?.text}
        {isActive && " ACTIVE"}
        {query && ` ${query}`}
      </td>
    </tr>
  ),
}));

const pairs = [
  {
    source: { text: "Hello", start_ms: 0, end_ms: 1000 },
    translation: { text: "Hallo", start_ms: 0, end_ms: 1000 },
    start_ms: 0,
    end_ms: 1000,
    index: 0,
  },
  {
    source: { text: "World", start_ms: 1000, end_ms: 2000 },
    translation: { text: "Welt", start_ms: 1000, end_ms: 2000 },
    start_ms: 1000,
    end_ms: 2000,
    index: 1,
  },
];

const baseProps = {
  query: "",
  currentTimeMs: 500,
  subtitlePairs: pairs,
  filteredSubtitlePairs: pairs,
  shouldShowSourceLine: true,
  shouldShowTranslationLine: true,
  isLoading: false,
};

describe("SubtitleList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders subtitle rows", () => {
    render(<SubtitleList {...baseProps} />);

    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/World/)).toBeInTheDocument();
  });

  it("marks the active subtitle", () => {
    render(<SubtitleList {...baseProps} />);

    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<SubtitleList {...baseProps} isLoading />);

    expect(screen.getByText("Loading subtitles...")).toBeInTheDocument();
  });

  it("renders hidden tracks message", () => {
    render(
      <SubtitleList
        {...baseProps}
        shouldShowSourceLine={false}
        shouldShowTranslationLine={false}
      />,
    );

    expect(
      screen.getByText("All subtitle tracks are hidden."),
    ).toBeInTheDocument();
  });

  it("renders no results message", () => {
    render(
      <SubtitleList
        {...baseProps}
        query="missing"
        filteredSubtitlePairs={[]}
      />,
    );

    expect(screen.getByText(/No results for/)).toBeInTheDocument();
    expect(screen.getByText(/missing/)).toBeInTheDocument();
  });

  it("renders filtered pairs only", () => {
    render(<SubtitleList {...baseProps} filteredSubtitlePairs={[pairs[1]]} />);

    expect(screen.getByText(/World/)).toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });

  it("updates active row when current time changes", () => {
    const { rerender } = render(<SubtitleList {...baseProps} />);

    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();

    rerender(<SubtitleList {...baseProps} currentTimeMs={1500} />);

    const activeRows = screen.getAllByText(/ACTIVE/);
    expect(activeRows).toHaveLength(1);
    expect(screen.getByTestId("subtitle-row-1")).toContainElement(
      activeRows[0],
    );
  });

  it("does not show active row when outside subtitle ranges", () => {
    render(<SubtitleList {...baseProps} currentTimeMs={5000} />);

    expect(screen.queryByText(/ACTIVE/)).not.toBeInTheDocument();
  });
});
