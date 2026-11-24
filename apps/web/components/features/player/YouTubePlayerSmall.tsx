"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface PlayableMediaItem {
  source_text: string;
  translation_text: string;
  start_ms: number;
  end_ms: number;
  media_title: string;
}

interface YouTubePlayerSmallProps {
  videoId: string;
  mediaItem: PlayableMediaItem;
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

export default function YouTubePlayerSmall({
  videoId,
  mediaItem,
}: YouTubePlayerSmallProps) {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const isReadyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSeenEndRef = useRef(false);
  const lastHasSeenEndRef = useRef(0);

  const [hasEnded, setHasEnded] = useState(false);

  const { autoPlay } = useAppStore();

  const handleReplay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !isReadyRef.current) return;

    hasSeenEndRef.current = false;
    lastHasSeenEndRef.current = Date.now();
    setHasEnded(false);
    player.seekTo(mediaItem.start_ms / 1000, true);
    player.playVideo();
  }, [mediaItem]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      await loadYouTubeAPI();
      if (destroyed || !iframeContainerRef.current) return;

      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 0,
          cc_load_policy: 0,
          start: Math.floor(mediaItem.start_ms / 1000),
        },
        events: {
          onReady: () => {
            isReadyRef.current = true;

            hasSeenEndRef.current = false;
            lastHasSeenEndRef.current = Date.now();
            setHasEnded(false);
            playerRef.current?.seekTo(mediaItem.start_ms / 1000, true);
            if (autoPlay) playerRef.current?.playVideo();
          },
        },
      });
    }

    init();

    return () => {
      destroyed = true;
      isReadyRef.current = false;
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    hasSeenEndRef.current = false;
    lastHasSeenEndRef.current = Date.now();
    setHasEnded(false);
    playerRef.current.seekTo(mediaItem.start_ms / 1000, true);
    if (autoPlay) playerRef.current.playVideo();
  }, [mediaItem, autoPlay]);

  useAnimationTick(
    () => {
      const player = playerRef.current;
      if (!player || !isReadyRef.current) return;

      const ms = Math.floor((player.getCurrentTime?.() ?? 0) * 1000);

      if (
        ms >= mediaItem.end_ms &&
        !hasSeenEndRef.current &&
        lastHasSeenEndRef.current < Date.now() - 100
      ) {
        hasSeenEndRef.current = true;
        player.pauseVideo();
        setHasEnded(true);
      }
    },
    { autoStart: true },
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full content-center bg-black overflow-hidden group"
    >
      <div ref={iframeContainerRef} className="w-full h-full" />

      {hasEnded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
          <Button
            onClick={handleReplay}
            size="icon"
            variant="outline"
            aria-label="Replay Clip"
            className="w-14 h-14 rounded-full bg-background/90 text-foreground border shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
