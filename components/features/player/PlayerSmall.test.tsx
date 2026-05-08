import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PlayerSmall from "./PlayerSmall";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import { act } from "react";

vi.mock("plyr/dist/plyr.css", () => ({}));

vi.mock("plyr", () => {
  class PlyrMock {
    destroy = vi.fn();
    play = vi.fn();
    pause = vi.fn();
    on = vi.fn();
    off = vi.fn();
  }

  return {
    default: PlyrMock,
  };
});

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
let tick: (ms: number) => void;

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: {
      fontSize: 24,
    },
  });

  mockedUseAnimationTick.mockImplementation((cb) => {
    tick = cb;
  });
});

const sourceLine = {
  index: 1,
  start_ms: 0,
  end_ms: 1000,
  text: "hello",
};

const translationLine = {
  index: 1,
  start_ms: 0,
  end_ms: 1000,
  text: "hallo",
};

const baseProps = {
  streamUrl: "http://localhost/video.mp4",
  title: "Movie",
  sourceLine,
  translationLine,
  startMs: 1000,
  endMs: 5000,
  autoPlay: false,
};

describe("PlayerSmall", () => {
  it("renders video element", () => {
    render(<PlayerSmall {...baseProps} />);

    expect(screen.getByTitle("Movie")).toBeInTheDocument();
    expect(screen.getByTestId("subtitle-overlay")).toBeInTheDocument();
    expect(screen.getByText("Overlay 1000")).toBeInTheDocument();

    expect(mockedUseAnimationTick).toHaveBeenCalled();
  });

  it("autoplays when autoPlay is enabled", () => {
    render(<PlayerSmall {...baseProps} autoPlay />);

    const video = screen.getByTitle("Movie") as HTMLVideoElement;

    const playMock = vi.fn();

    video.play = playMock;

    fireEvent(video, new Event("canplay"));

    expect(playMock).toHaveBeenCalled();
    expect(video.currentTime).toBe(1);
  });

  it("shows replay overlay when video reaches end", async () => {
    render(<PlayerSmall {...baseProps} startMs={0} endMs={0} />);

    await act(async () => {
      tick(0);
    });

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("pauses video when reaching end", () => {
    render(<PlayerSmall {...baseProps} startMs={0} endMs={0} />);

    const video = screen.getByTitle("Movie") as HTMLVideoElement;

    const pauseMock = vi.fn();

    video.pause = pauseMock;

    mockedUseAnimationTick.mock.calls[0]?.[0](0);

    expect(pauseMock).toHaveBeenCalled();
  });

  it("replays video when replay button clicked", async () => {
    render(<PlayerSmall {...baseProps} startMs={0} endMs={0} />);

    const video = screen.getByTitle("Movie") as HTMLVideoElement;

    const playMock = vi.fn();

    video.play = playMock;

    await act(async () => {
      tick(0);
    });

    fireEvent.click(screen.getByRole("button"));

    expect(video.currentTime).toBe(0);

    expect(playMock).toHaveBeenCalled();
  });

  it("hides replay overlay after replay", async () => {
    render(<PlayerSmall {...baseProps} startMs={0} endMs={0} />);

    mockedUseAnimationTick.mock.calls[0]?.[0](0);

    await act(async () => {
      tick(0);
    });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
