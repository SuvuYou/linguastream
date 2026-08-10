import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import PlayerSmall from "./PlayerSmall";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";

vi.mock("plyr/dist/plyr.css", () => ({}));

const destroyMock = vi.fn();

class PlyrMock {
  source = null;
  destroy = destroyMock;
}

vi.mock("plyr", () => ({
  default: PlyrMock,
}));

vi.mock("@/hooks/useAnimationTick", () => ({
  useAnimationTick: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseAnimationTick = vi.mocked(useAnimationTick);

let tick!: () => void;

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    autoPlay: false,
    subtitleSettings: {},
  });

  mockedUseAnimationTick.mockImplementation((cb) => {
    tick = cb;
  });
});

const mediaItem = {
  media_title: "Movie",
  start_ms: 1000,
  end_ms: 5000,
  source_text: "hello",
  translation_text: "hallo",
} as any;

const baseProps = {
  streamUrl: "http://localhost/video.mp4",
  mediaItem,
};

describe("PlayerSmall", () => {
  it("renders video and overlay", () => {
    render(<PlayerSmall {...baseProps} />);

    expect(screen.getByTitle("Movie")).toBeInTheDocument();

    expect(mockedUseAnimationTick).toHaveBeenCalled();
  });

  it("autoplays when enabled", () => {
    mockedUseAppStore.mockReturnValue({
      autoPlay: true,
      subtitleSettings: {},
    });

    render(<PlayerSmall {...baseProps} />);

    const video = screen.getByTitle("Movie") as HTMLVideoElement;
    const playMock = vi.fn();

    video.play = playMock;

    fireEvent(video, new Event("canplay"));

    expect(playMock).toHaveBeenCalled();
    expect(video.currentTime).toBe(1);
  });

  it("shows replay button when clip ends", async () => {
    render(
      <PlayerSmall
        streamUrl={baseProps.streamUrl}
        mediaItem={{
          ...mediaItem,
          start_ms: 0,
          end_ms: 0,
        }}
      />,
    );

    await act(async () => {
      tick();
    });

    expect(
      screen.getByRole("button", { name: /replay clip/i }),
    ).toBeInTheDocument();
  });

  it("pauses video when clip ends", () => {
    render(
      <PlayerSmall
        streamUrl={baseProps.streamUrl}
        mediaItem={{
          ...mediaItem,
          start_ms: 0,
          end_ms: 0,
        }}
      />,
    );

    const video = screen.getByTitle("Movie") as HTMLVideoElement;
    const pauseMock = vi.fn();

    video.pause = pauseMock;

    mockedUseAnimationTick.mock.calls[0][0]();

    expect(pauseMock).toHaveBeenCalled();
  });

  it("replays when replay button is clicked", async () => {
    render(
      <PlayerSmall
        streamUrl={baseProps.streamUrl}
        mediaItem={{
          ...mediaItem,
          start_ms: 0,
          end_ms: 0,
        }}
      />,
    );

    const video = screen.getByTitle("Movie") as HTMLVideoElement;

    const playMock = vi.fn();
    video.play = playMock;

    await act(async () => {
      tick();
    });

    fireEvent.click(screen.getByRole("button", { name: /replay clip/i }));

    expect(video.currentTime).toBe(0);
    expect(playMock).toHaveBeenCalled();
  });

  it("hides replay overlay after replay", async () => {
    render(
      <PlayerSmall
        streamUrl={baseProps.streamUrl}
        mediaItem={{
          ...mediaItem,
          start_ms: 0,
          end_ms: 0,
        }}
      />,
    );

    await act(async () => {
      tick();
    });

    fireEvent.click(screen.getByRole("button", { name: /replay clip/i }));

    expect(
      screen.queryByRole("button", { name: /replay clip/i }),
    ).not.toBeInTheDocument();
  });
});
