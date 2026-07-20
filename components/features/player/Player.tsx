"use client";

import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";
import SubtitleOverlay from "@/components/features/watch/SubtitleOverlay";
import { useAppStore } from "@/lib/initializations/store";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAnimationTick } from "@/hooks/useAnimationTick";
import Events from "@/events";

interface PlayerProps {
  initialTimeMs?: number;
  currentTimeMs: number;
  streamUrl: string;
  title: string;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  translationLanguages: string[];
  activeTranslationLang: string | null;
  setCurrentTimeMs: (timeMs: number) => void;
  handleSubtitleWordClick: (
    clean: string,
    line: SubtitleLine,
    contextTranslation: string,
  ) => void;
}

export default function Player({
  initialTimeMs = 0,
  streamUrl,
  title,
  sourceLines,
  translationLines,
  currentTimeMs,
  setCurrentTimeMs,
  handleSubtitleWordClick,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);

  const { subtitleSettings } = useAppStore();

  useEffect(() => {
    const setup = async () => {
      if (!videoRef.current || typeof window === "undefined") return;

      const mod = await import("plyr");
      const Plyr = mod.default ?? mod;
      plyrRef.current = new Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "fullscreen",
        ],
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
    if (!videoRef.current) return;

    videoRef.current.currentTime = initialTimeMs / 1000;
  }, [initialTimeMs]);

  useEffect(() => {
    const onJump = ({ ms }: { ms: number }) => {
      if (videoRef.current) {
        videoRef.current.currentTime = ms / 1000;
      }
    };

    const unsubscribe = Events.player.onJumpTo(onJump);

    return () => unsubscribe();
  }, []);

  useAnimationTick(
    () => {
      if (videoRef.current) {
        const ms = Math.floor(videoRef.current.currentTime * 1000);
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

      <video ref={videoRef} title={title} playsInline>
        <source src={streamUrl} type="video/mp4" />
      </video>
    </div>
  );
}
