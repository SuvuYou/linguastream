import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import Player from "./Player";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import Events from "@/events";

vi.mock("plyr/dist/plyr.css", () => ({}));

const PlyrMock = vi.fn().mockImplementation(() => ({
  destroy: vi.fn(),
  source: null,
}));

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

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseAnimationTick = vi.mocked(useAnimationTick);

const unsubscribeMock = vi.fn();
const onJumpToMock = vi.fn(() => unsubscribeMock);

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: {
      fontSize: 24,
    },
  });

  mockedUseAnimationTick.mockImplementation((cb) => cb());

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
  setCurrentTimeMs: vi.fn(),
};

describe("Player", () => {
  it("renders video and subtitle overlay", () => {
    render(<Player {...baseProps} />);

    expect(screen.getByTitle("Movie")).toBeInTheDocument();
    expect(screen.getByTestId("subtitle-overlay")).toBeInTheDocument();
    expect(screen.getByText("Overlay 1000")).toBeInTheDocument();

    expect(onJumpToMock).toHaveBeenCalled();
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
