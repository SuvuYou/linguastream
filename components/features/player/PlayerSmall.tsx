"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";
import SubtitleOverlay from "@/components/features/watch/SubtitleOverlay";
import { useAppStore } from "@/lib/initializations/store";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAnimationTick } from "@/hooks/useAnimationTick";

interface PlayerSmallProps {
  streamUrl: string;
  title: string;
  sourceLine: SubtitleLine | null;
  translationLine: SubtitleLine | null;
  startMs: number;
  endMs: number;
  autoPlay: boolean;
}

export default function PlayerSmall({
  streamUrl,
  title,
  sourceLine,
  translationLine,
  startMs,
  endMs,
  autoPlay,
}: PlayerSmallProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSeenEndRef = useRef(false);

  const [currentTimeMs, setCurrentTimeMs] = useState(startMs);
  const [hasEnded, setHasEnded] = useState(false);

  const { subtitleSettings } = useAppStore();

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
    const video = videoRef.current;
    if (!video) return;

    hasSeenEndRef.current = false;
    setHasEnded(false);

    const onCanPlay = () => {
      video.currentTime = startMs / 1000;
      if (autoPlay) video.play();
    };

    video.addEventListener("canplay", onCanPlay, { once: true });
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [streamUrl, startMs, autoPlay]);

  useAnimationTick(
    () => {
      const video = videoRef.current;
      if (!video) return;

      const ms = Math.floor(video.currentTime * 1000);
      setCurrentTimeMs(ms);

      if (ms >= endMs && !hasSeenEndRef.current) {
        hasSeenEndRef.current = true;
        video.pause();
        setHasEnded(true);
      }
    },
    { autoStart: true },
  );

  function handleReplay() {
    const video = videoRef.current;
    if (!video) return;
    hasSeenEndRef.current = false;
    setHasEnded(false);
    video.currentTime = startMs / 1000;
    video.play();
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full grid content-center"
    >
      <div className="w-full h-full object-contain col-start-1 row-start-1">
        <video ref={videoRef} title={title} playsInline>
          <source src={streamUrl} type="video/mp4" />
        </video>
      </div>

      <div className="relative col-start-1 row-start-1 self-end">
        <SubtitleOverlay
          currentTimeMs={currentTimeMs}
          sourceLines={sourceLine ? [sourceLine] : []}
          translationLines={translationLine ? [translationLine] : []}
          settings={subtitleSettings}
        />
      </div>

      {hasEnded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <button
            onClick={handleReplay}
            className="w-14 h-14 rounded-full bg-background/80 border border-primary-border flex items-center justify-center text-primary-text hover:bg-background transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M3.51 15a9 9 0 1 0 .49-3.14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
