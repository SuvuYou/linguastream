declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface VideoPlayer {
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  setPlaybackRate(rate: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}

export interface VideoPlayerEvents {
  onReady(): void;
  onPlayingChange(playing: boolean): void;
  onError(code: number): void;
}

export type VideoPlayerFactory = (
  host: HTMLElement,
  options: { youtubeVideoId: string; startSeconds: number },
  events: VideoPlayerEvents,
) => Promise<VideoPlayer>;

let apiReady: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  apiReady ??= new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady as (() => void) | undefined;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiReady;
}

export const youtubePlayerFactory: VideoPlayerFactory = async (
  host,
  { youtubeVideoId, startSeconds },
  events,
) => {
  await loadYouTubeApi();
  const player = new window.YT.Player(host, {
    videoId: youtubeVideoId,
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      start: Math.floor(startSeconds),
    },
    events: {
      onReady: () => events.onReady(),
      onStateChange: (event) => {
        const { PLAYING, PAUSED, ENDED } = window.YT.PlayerState;
        if (event.data === PLAYING) events.onPlayingChange(true);
        else if (event.data === PAUSED || event.data === ENDED)
          events.onPlayingChange(false);
      },
      onError: (event) => events.onError(event.data),
    },
  });
  return {
    play: () => player.playVideo(),
    pause: () => player.pauseVideo(),
    seekTo: (seconds) => player.seekTo(seconds, true),
    getCurrentTime: () => player.getCurrentTime(),
    getDuration: () => player.getDuration(),
    setPlaybackRate: (rate) => player.setPlaybackRate(rate),
    setVolume: (volume) => player.setVolume(volume),
    mute: () => player.mute(),
    unMute: () => player.unMute(),
    destroy: () => player.destroy(),
  };
};
