"use client";

import { useCallback, useEffect, useRef } from "react";
import SubtitleOverlay from "@/components/features/watch/SubtitleOverlay";
import { useAppStore } from "@/lib/initializations/store";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import Events from "@/events";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  initialTimeMs?: number;
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  translationLanguages: string[];
  activeTranslationLang: string | null;
  setCurrentTimeMs: (ms: number) => void;
  handleSubtitleWordClick: (
    clean: string,
    line: SubtitleLine,
    contextTranslation: string,
    contextLines: SubtitleLine[],
  ) => void;
}

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = resolve;
  });
}

export default function YouTubePlayer({
  videoId,
  initialTimeMs = 0,
  currentTimeMs,
  sourceLines,
  translationLines,
  setCurrentTimeMs,
  handleSubtitleWordClick,
}: YouTubePlayerProps) {
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<YT.Player | null>(null);
  const isReadyRef = useRef(false);

  const { subtitleSettings } = useAppStore();

  useEffect(() => {
    async function init() {
      await loadYouTubeAPI();

      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 0,
          cc_load_policy: 0,
          start: Math.floor(initialTimeMs / 1000),
        },
        events: {
          onReady: () => {
            isReadyRef.current = true;
          },
        },
      });
    }

    init();

    return () => {
      playerRef.current?.destroy();
    };
  }, [videoId, initialTimeMs]);

  useEffect(() => {
    return Events.player.onJumpTo(({ ms }) => {
      if (!playerRef.current || !isReadyRef.current) {
        return;
      }

      playerRef.current.seekTo(ms / 1000, true);
    });
  }, []);

  const seekBy = useCallback(
    (seconds: number) => {
      if (!playerRef.current || !isReadyRef.current) {
        return;
      }

      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();

      const nextTime = Math.max(0, Math.min(currentTime + seconds, duration));

      playerRef.current.seekTo(nextTime, true);

      setCurrentTimeMs(Math.floor(nextTime * 1000));
    },
    [setCurrentTimeMs],
  );

  useAnimationTick(
    () => {
      if (!playerRef.current || !isReadyRef.current) {
        return;
      }

      const ms = Math.floor((playerRef.current.getCurrentTime?.() ?? 0) * 1000);

      setCurrentTimeMs(ms);
    },
    { autoStart: true },
  );

  return (
    <div className="relative flex flex-wrap items-start w-full h-full max-w-6xl">
      <div className="relative w-full aspect-video mt-4">
        <div ref={iframeContainerRef} className="w-full h-full" />

        <Button
          onClick={() => seekBy(-2)}
          variant={"secondary"}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 bg-secondary/60 active:not-aria-[haspopup]:-translate-y-1/2 "
          aria-label="Rewind 2 seconds"
        >
          −2s
        </Button>

        <Button
          onClick={() => seekBy(2)}
          variant={"secondary"}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 bg-secondary/60 active:not-aria-[haspopup]:-translate-y-1/2 active:not-aria-[haspopup]:bg-secondary"
          aria-label="Forward 2 seconds"
        >
          +2s
        </Button>
      </div>

      <SubtitleOverlay
        currentTimeMs={currentTimeMs}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={subtitleSettings}
        handleSubtitleWordClick={handleSubtitleWordClick}
      />
    </div>
  );
}
