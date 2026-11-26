"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { PlaybackClock } from "@/lib/watch/playback-clock";
import {
  youtubePlayerFactory,
  type VideoPlayer,
  type VideoPlayerFactory,
} from "@/lib/watch/video-player";

export const VideoPlayerFactoryContext =
  createContext<VideoPlayerFactory>(youtubePlayerFactory);

export const SEEK_SETTLE_MS = 2500;

interface PendingSeek {
  toMs: number;
  fromMs: number;
  at: number;
}

export type PlayerStatus = "loading" | "ready" | "error";

export interface VideoPlayerControls {
  status: PlayerStatus;
  playing: boolean;
  durationMs: number | null;
  rate: number;
  volume: number;
  muted: boolean;
  toggle(): void;
  seek(ms: number): void;
  jump(ms: number): void;
  setRate(rate: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
}

export function useVideoPlayer(
  hostRef: RefObject<HTMLElement | null>,
  youtubeVideoId: string,
  startMs: number,
  clock: PlaybackClock,
): VideoPlayerControls {
  const factory = useContext(VideoPlayerFactoryContext);
  const playerRef = useRef<VideoPlayer | null>(null);
  const pendingSeekRef = useRef<PendingSeek | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [playing, setPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [rate, setRateState] = useState(1);
  const [volume, setVolumeState] = useState(100);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const mount = document.createElement("div");
    host.replaceChildren(mount);

    void factory(
      mount,
      { youtubeVideoId, startSeconds: startMs / 1000 },
      {
        onReady: () => {
          if (disposed) return;
          host.querySelector("iframe")?.setAttribute("tabindex", "-1");
          const seconds = playerRef.current?.getDuration() ?? 0;
          setDurationMs(seconds > 0 ? Math.round(seconds * 1000) : null);
          setStatus("ready");
        },
        onPlayingChange: (isPlaying) => !disposed && setPlaying(isPlaying),
        onError: () => !disposed && setStatus("error"),
      },
    )
      .then((player) => {
        if (disposed) player.destroy();
        else playerRef.current = player;
      })
      .catch(() => !disposed && setStatus("error"));

    return () => {
      disposed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [factory, hostRef, youtubeVideoId, startMs]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const player = playerRef.current;
      if (player) {
        const ms = Math.round(player.getCurrentTime() * 1000);
        const pending = pendingSeekRef.current;
        if (pending) {
          const now = performance.now();
          const staleMs = pending.fromMs + (now - pending.at);
          const landed = Math.abs(ms - pending.toMs) < Math.abs(ms - staleMs);
          if (landed || now - pending.at > SEEK_SETTLE_MS)
            pendingSeekRef.current = null;
        }
        if (!pendingSeekRef.current) clock.set(ms);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, clock]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player || status !== "ready") return;
    if (playing) player.pause();
    else player.play();
  }, [playing, status]);

  const seek = useCallback(
    (ms: number) => {
      const player = playerRef.current;
      if (!player || status !== "ready") return;
      pendingSeekRef.current = {
        toMs: ms,
        fromMs: clock.get(),
        at: performance.now(),
      };
      player.seekTo(ms / 1000);
      clock.set(ms);
    },
    [clock, status],
  );

  const jump = useCallback(
    (ms: number) => {
      const player = playerRef.current;
      if (!player || status !== "ready") return;
      pendingSeekRef.current = {
        toMs: ms,
        fromMs: clock.get(),
        at: performance.now(),
      };
      player.seekTo(ms / 1000);
      clock.set(ms);
      if (!playing) player.play();
    },
    [clock, playing, status],
  );

  const setRate = useCallback((next: number) => {
    playerRef.current?.setPlaybackRate(next);
    setRateState(next);
  }, []);

  const setVolume = useCallback(
    (next: number) => {
      const player = playerRef.current;
      if (!player) return;
      player.setVolume(next);
      if (next > 0 && muted) {
        player.unMute();
        setMuted(false);
      }
      setVolumeState(next);
    },
    [muted],
  );

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) player.unMute();
    else player.mute();
    setMuted(!muted);
  }, [muted]);

  return {
    status,
    playing,
    durationMs,
    rate,
    volume,
    muted,
    toggle,
    seek,
    jump,
    setRate,
    setVolume,
    toggleMute,
  };
}
