"use client";

import { useEffect, useRef } from "react";
import SubtitleOverlay from "@/components/features/watch/SubtitleOverlay";
import { useAppStore } from "@/lib/initializations/store";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import Events from "@/events";

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
    let destroyed = false;

    async function init() {
      await loadYouTubeAPI();
      if (destroyed || !iframeContainerRef.current) return;

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
      destroyed = true;
      playerRef.current?.destroy();
    };
  }, [videoId, initialTimeMs]);

  useEffect(() => {
    return Events.player.onJumpTo(({ ms }) => {
      if (playerRef.current && isReadyRef.current) {
        playerRef.current.seekTo(ms / 1000, true);
      }
    });
  }, []);

  useAnimationTick(
    () => {
      if (playerRef.current && isReadyRef.current) {
        const ms = Math.floor(
          (playerRef.current.getCurrentTime?.() ?? 0) * 1000,
        );
        setCurrentTimeMs(ms);
      }
    },
    { autoStart: true },
  );

  return (
    <div className="relative w-full max-w-6xl">
      <SubtitleOverlay
        currentTimeMs={currentTimeMs}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={subtitleSettings}
        handleSubtitleWordClick={handleSubtitleWordClick}
      />

      <div ref={iframeContainerRef} className="w-full aspect-video" />
    </div>
  );
}
