import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SubtitleSidebar from "./SubtitleSidebar";
import Events from "@/events";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/events", () => ({
  default: {
    player: {
      triggerJumpTo: vi.fn(),
    },
  },
}));

const triggerJumpToMock = Events.player.triggerJumpTo;

const baseSettings = {
  showSource: true,
  showTranslation: true,
  sourceFontSize: "medium" as "medium" | "small" | "large",
  translationFontSize: "medium" as "medium" | "small" | "large",
  fontColor: "#fff",
  backgroundColor: "#000",
  fontOpacity: 1,
  backgroundOpacity: 1,
};

const sourceLines = [
  { index: 0, start_ms: 0, end_ms: 1000, text: "hello world" },
  { index: 0, start_ms: 2000, end_ms: 3000, text: "second line" },
];

const translationLines = [
  { index: 0, start_ms: 0, end_ms: 1000, text: "hallo welt" },
];

const mockedUseAppStore = vi.mocked(useAppStore);
Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: baseSettings,
  });
});

describe("SubtitleSidebar", () => {
  it("renders subtitle lines", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("hello world")).toBeInTheDocument();

    expect(screen.getByText("hallo welt")).toBeInTheDocument();
  });

  it("renders empty state when all tracks hidden", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={{
          ...baseSettings,
          showSource: false,
          showTranslation: false,
        }}
      />,
    );

    expect(
      screen.getByText(/all subtitle tracks are hidden/i),
    ).toBeInTheDocument();
  });

  it("shows no results message when query has no match", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    const input = screen.getByPlaceholderText(/search subtitles/i);

    fireEvent.change(input, {
      target: { value: "zzz" },
    });

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("filters subtitles by query", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    const input = screen.getByPlaceholderText(/search subtitles/i);

    fireEvent.change(input, {
      target: { value: "hello" },
    });

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();

    expect(screen.queryByText("second line")).not.toBeInTheDocument();
  });

  it("shows result count", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText(/2 lines/i)).toBeInTheDocument();
  });

  it("shows filtered result count", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    const input = screen.getByPlaceholderText(/search subtitles/i);

    fireEvent.change(input, {
      target: { value: "hello" },
    });

    expect(screen.getByText(/1 result/i)).toBeInTheDocument();
  });

  it("jumps to subtitle on click", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    fireEvent.click(screen.getByText("hello world"));

    expect(triggerJumpToMock).toHaveBeenCalledWith(0);
  });

  it("does not crash when empty arrays", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={[]}
        translationLines={[]}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText(/0 lines/i)).toBeInTheDocument();
    expect(
      screen.getByText(/All subtitle tracks are hidden./i),
    ).toBeInTheDocument();
  });

  it("does not show hidden tracks", () => {
    render(
      <SubtitleSidebar
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={{
          ...baseSettings,
          showSource: false,
        }}
      />,
    );

    expect(screen.queryByText("hello world")).not.toBeInTheDocument();

    expect(screen.getByText("hallo welt")).toBeInTheDocument();
  });
});
