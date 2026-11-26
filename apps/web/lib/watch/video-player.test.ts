import { afterEach, describe, expect, it, vi } from "vitest";
import { youtubePlayerFactory } from "./video-player";

type Options = {
  videoId: string;
  playerVars: Record<string, number>;
  events: Record<string, (e: { data: number }) => void>;
};

function installFakeYT() {
  const instance = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    getCurrentTime: vi.fn(() => 12.5),
    getDuration: vi.fn(() => 300),
    setPlaybackRate: vi.fn(),
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
  };
  let options: Options | undefined;
  const Player = vi.fn(function (_host: HTMLElement, o: Options) {
    options = o;
    return instance;
  });
  window.YT = {
    Player,
    PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 },
  } as unknown as typeof YT;
  return { instance, Player, options: () => options! };
}

afterEach(() => {
  delete (window as Partial<Window>).YT;
});

describe("youtubePlayerFactory", () => {
  it("creates a player without YouTube's controls or captions, starting at the given second", async () => {
    const yt = installFakeYT();
    await youtubePlayerFactory(
      document.createElement("div"),
      { youtubeVideoId: "abc", startSeconds: 42.9 },
      {
        onReady: vi.fn(),
        onPlayingChange: vi.fn(),
        onError: vi.fn(),
      },
    );

    expect(yt.options().videoId).toBe("abc");
    expect(yt.options().playerVars).toMatchObject({
      controls: 0,
      disablekb: 1,
      cc_load_policy: 0,
      start: 42,
    });
  });

  it("forwards player events and commands", async () => {
    const yt = installFakeYT();
    const events = {
      onReady: vi.fn(),
      onPlayingChange: vi.fn(),
      onError: vi.fn(),
    };
    const player = await youtubePlayerFactory(
      document.createElement("div"),
      { youtubeVideoId: "abc", startSeconds: 0 },
      events,
    );

    yt.options().events.onReady!({ data: 0 });
    yt.options().events.onStateChange!({ data: 1 });
    yt.options().events.onStateChange!({ data: 3 });
    yt.options().events.onStateChange!({ data: 2 });
    yt.options().events.onStateChange!({ data: 0 });
    yt.options().events.onError!({ data: 150 });
    expect(events.onReady).toHaveBeenCalled();
    expect(events.onPlayingChange.mock.calls).toEqual([
      [true],
      [false],
      [false],
    ]);
    expect(events.onError).toHaveBeenCalledWith(150);

    player.play();
    player.pause();
    player.seekTo(10);
    player.setPlaybackRate(1.25);
    player.setVolume(40);
    player.mute();
    player.unMute();
    player.destroy();
    expect(player.getCurrentTime()).toBe(12.5);
    expect(player.getDuration()).toBe(300);
    expect(yt.instance.playVideo).toHaveBeenCalled();
    expect(yt.instance.pauseVideo).toHaveBeenCalled();
    expect(yt.instance.seekTo).toHaveBeenCalledWith(10, true);
    expect(yt.instance.setPlaybackRate).toHaveBeenCalledWith(1.25);
    expect(yt.instance.setVolume).toHaveBeenCalledWith(40);
    expect(yt.instance.mute).toHaveBeenCalled();
    expect(yt.instance.unMute).toHaveBeenCalled();
    expect(yt.instance.destroy).toHaveBeenCalled();
  });

  it("loads the IFrame API once when it isn't there yet", async () => {
    const created = youtubePlayerFactory(
      document.createElement("div"),
      { youtubeVideoId: "abc", startSeconds: 0 },
      { onReady: vi.fn(), onPlayingChange: vi.fn(), onError: vi.fn() },
    );
    const scripts = document.head.querySelectorAll(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    expect(scripts).toHaveLength(1);

    const yt = installFakeYT();
    window.onYouTubeIframeAPIReady();
    await created;
    expect(yt.Player).toHaveBeenCalledTimes(1);
  });
});
