import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import {
  createPlaybackClock,
  type PlaybackClock,
} from "@/lib/watch/playback-clock";
import type {
  VideoPlayer,
  VideoPlayerEvents,
  VideoPlayerFactory,
} from "@/lib/watch/video-player";
import {
  SEEK_SETTLE_MS,
  useVideoPlayer,
  VideoPlayerFactoryContext,
  type VideoPlayerControls,
} from "./useVideoPlayer";

let frames: FrameRequestCallback[] = [];
const runFrame = () => {
  const pending = frames;
  frames = [];
  act(() => pending.forEach((cb) => cb(performance.now())));
};

beforeEach(() => {
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    frames.push(cb),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function setup() {
  const state = { seconds: 10 };
  let events: VideoPlayerEvents | undefined;
  const player: VideoPlayer = {
    play: vi.fn(() => events?.onPlayingChange(true)),
    pause: vi.fn(),
    seekTo: vi.fn(),
    getCurrentTime: () => state.seconds,
    getDuration: () => 600,
    setPlaybackRate: vi.fn(),
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
  };
  const factory: VideoPlayerFactory = async (host, _options, ev) => {
    events = ev;
    host.replaceWith(
      Object.assign(document.createElement("iframe"), { id: "yt" }),
    );
    setTimeout(() => ev.onReady(), 0);
    return player;
  };
  const clock = createPlaybackClock(10_000);
  const result: { current: VideoPlayerControls | null } = { current: null };

  function Harness({ clock }: { clock: PlaybackClock }) {
    const hostRef = useRef<HTMLDivElement>(null);
    result.current = useVideoPlayer(hostRef, "abc", 10_000, clock);
    return <div ref={hostRef} />;
  }

  const view = render(
    <VideoPlayerFactoryContext.Provider value={factory}>
      <Harness clock={clock} />
    </VideoPlayerFactoryContext.Provider>,
  );
  return { state, player, clock, result, view };
}

describe("useVideoPlayer", () => {
  it("keeps YouTube's iframe out of the tab order", async () => {
    const { result, view } = setup();
    await waitFor(() => expect(result.current!.status).toBe("ready"));
    expect(view.container.querySelector("iframe")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("holds the clock at a seek target until the player reports it", async () => {
    const { state, clock, result } = setup();
    await waitFor(() => expect(result.current!.status).toBe("ready"));
    act(() => result.current!.toggle());
    await waitFor(() => expect(result.current!.playing).toBe(true));

    act(() => result.current!.jump(60_000));
    expect(clock.get()).toBe(60_000);

    state.seconds = 10.2;
    runFrame();
    expect(clock.get()).toBe(60_000);

    state.seconds = 59.95;
    runFrame();
    expect(clock.get()).toBe(59_950);

    state.seconds = 60.3;
    runFrame();
    expect(clock.get()).toBe(60_300);
  });

  it("follows the player again when a seek never lands", async () => {
    const { state, clock, result } = setup();
    await waitFor(() => expect(result.current!.status).toBe("ready"));
    act(() => result.current!.toggle());
    await waitFor(() => expect(result.current!.playing).toBe(true));
    const now = vi.spyOn(performance, "now");
    now.mockReturnValue(1000);

    act(() => result.current!.seek(60_000));
    state.seconds = 10.5;
    now.mockReturnValue(1000 + SEEK_SETTLE_MS + 1);
    runFrame();
    expect(clock.get()).toBe(10_500);
    now.mockRestore();
  });
});
