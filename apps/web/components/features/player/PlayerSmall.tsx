"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";
import { useAppStore } from "@/lib/initializations/store";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export interface PlayableMediaItem {
  source_text: string;
  translation_text: string;
  start_ms: number;
  end_ms: number;
  media_title: string;
}

interface PlayerSmallProps {
  streamUrl: string;
  mediaItem: PlayableMediaItem;
}

export default function PlayerSmall({
  streamUrl,
  mediaItem,
}: PlayerSmallProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSeenEndRef = useRef(false);

  const [hasEnded, setHasEnded] = useState(false);

  const { autoPlay } = useAppStore();

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    hasSeenEndRef.current = false;
    setHasEnded(false);
    video.currentTime = mediaItem.start_ms / 1000;
    video.play();
  }, [mediaItem]);

  useEffect(() => {
    const setup = async () => {
      if (!videoRef.current || typeof window === "undefined") return;
      const mod = await import("plyr");
      const Plyr = mod.default ?? mod;
      plyrRef.current = new Plyr(videoRef.current, {
        controls: ["play", "mute", "volume"],
        captions: { active: false },
      });
    };
    setup();
    return () => {
      plyrRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!plyrRef.current) return;
    plyrRef.current.source = {
      type: "video",
      sources: [{ src: streamUrl, type: "video/mp4" }],
    };
  }, [streamUrl]);

  useEffect(() => {
    handleReplay();
  }, [mediaItem, handleReplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hasSeenEndRef.current = false;
    setHasEnded(false);

    const onCanPlay = () => {
      video.currentTime = mediaItem.start_ms / 1000;
      if (autoPlay) video.play();
    };

    video.addEventListener("canplay", onCanPlay, { once: true });
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [streamUrl, mediaItem, autoPlay]);

  useAnimationTick(
    () => {
      const video = videoRef.current;
      if (!video) return;

      const ms = Math.floor(video.currentTime * 1000);

      if (ms >= mediaItem.end_ms && !hasSeenEndRef.current) {
        hasSeenEndRef.current = true;
        video.pause();
        setHasEnded(true);
      }
    },
    { autoStart: true },
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full grid content-center bg-black overflow-hidden group"
    >
      <div className="w-full h-full object-contain col-start-1 row-start-1">
        <video ref={videoRef} title={mediaItem.media_title} playsInline>
          <source src={streamUrl} type="video/mp4" />
        </video>
      </div>
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
