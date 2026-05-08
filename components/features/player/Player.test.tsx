import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Player from "./Player";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import Events from "@/events";

vi.mock("plyr/dist/plyr.css", () => ({}));

const destroyMock = vi.fn();

const plyrInstance = {
  destroy: destroyMock,
  source: null,
};

const PlyrMock = vi.fn().mockImplementation(function () {
  return plyrInstance;
});

vi.mock("plyr", () => ({
  default: PlyrMock,
}));

vi.mock("@/hooks/useAnimationTick", () => ({
  useAnimationTick: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/features/watch/SubtitleOverlay", () => ({
  default: ({ currentTimeMs }: { currentTimeMs: number }) => (
    <div data-testid="subtitle-overlay">Overlay {currentTimeMs}</div>
  ),
}));

vi.mock("@/components/features/watch/SubtitleSettings", () => ({
  default: ({
    onSettingsChange,
  }: {
    onSettingsChange: (v: unknown) => void;
  }) => (
    <button onClick={() => onSettingsChange({ fontSize: 42 })}>
      Mock Settings
    </button>
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseAnimationTick = vi.mocked(useAnimationTick);

const unsubscribeMock = vi.fn();

const onJumpToMock = vi.fn(() => unsubscribeMock);

const setSubtitleSettings = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: {
      fontSize: 24,
    },
    setSubtitleSettings,
  });

  mockedUseAnimationTick.mockImplementation((cb) => cb(0));

  Events.player.onJumpTo = onJumpToMock;
});

const baseProps = {
  currentTimeMs: 1000,
  streamUrl: "http://localhost/video.mp4",
  title: "Movie",
  sourceLines: [],
  translationLines: [],
  translationLanguages: [],
  activeTranslationLang: null,
  onTranslationLangChange: vi.fn(),
  setCurrentTimeMs: vi.fn(),
};

describe("Player", () => {
  it("renders video element", () => {
    render(<Player {...baseProps} />);

    expect(screen.getByTitle("Movie")).toBeInTheDocument();
    expect(screen.getByTestId("subtitle-overlay")).toBeInTheDocument();

    expect(screen.getByText("Overlay 1000")).toBeInTheDocument();

    expect(onJumpToMock).toHaveBeenCalled();
  });

  it("shows subtitle button on hover", () => {
    render(<Player {...baseProps} />);

    const container = screen.getByTitle("Movie").parentElement as HTMLElement;

    fireEvent.mouseEnter(container);

    expect(screen.getByText("Subtitles")).toBeInTheDocument();

    fireEvent.mouseLeave(container);

    expect(screen.queryByText("Subtitles")).not.toBeInTheDocument();
  });

  it("opens subtitle settings panel", () => {
    render(<Player {...baseProps} />);

    const container = screen.getByTitle("Movie").parentElement as HTMLElement;

    fireEvent.mouseEnter(container);

    fireEvent.click(screen.getByText("Subtitles"));

    expect(screen.getByText("Mock Settings")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Subtitles"));

    expect(screen.queryByText("Mock Settings")).not.toBeInTheDocument();
  });

  it("calls setSubtitleSettings from settings panel", () => {
    render(<Player {...baseProps} />);

    const container = screen.getByTitle("Movie").parentElement as HTMLElement;

    fireEvent.mouseEnter(container);

    fireEvent.click(screen.getByText("Subtitles"));

    fireEvent.click(screen.getByText("Mock Settings"));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      fontSize: 42,
    });
  });

  it("closes settings when clicking outside", () => {
    render(
      <div>
        <Player {...baseProps} />
        <button>Outside</button>
      </div>,
    );

    const container = screen.getByTitle("Movie").parentElement as HTMLElement;

    fireEvent.mouseEnter(container);

    fireEvent.click(screen.getByText("Subtitles"));

    expect(screen.getByText("Mock Settings")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Outside"));

    expect(screen.queryByText("Mock Settings")).not.toBeInTheDocument();
  });

  it("calls setCurrentTimeMs from animation tick", () => {
    const setCurrentTimeMs = vi.fn();

    render(<Player {...baseProps} setCurrentTimeMs={setCurrentTimeMs} />);

    expect(mockedUseAnimationTick).toHaveBeenCalled();
  });

  it("sets initial video time", () => {
    render(<Player {...baseProps} initialTimeMs={5000} />);

    const video = screen.getByTitle("Movie") as HTMLVideoElement;

    expect(video.currentTime).toBe(5);
  });

  it("cleans up jump listener on unmount", () => {
    const { unmount } = render(<Player {...baseProps} />);

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
