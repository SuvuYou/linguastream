"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";
import SubtitleOverlay from "@/components/features/watch/SubtitleOverlay";
import SubtitleSettingsPanel from "@/components/features/watch/SubtitleSettings";
import { useAppStore } from "@/lib/initializations/store";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAnimationTick } from "@/hooks/useAnimationTick";

interface PlayerProps {
  streamUrl: string;
  title: string;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  translationLanguages: string[];
  activeTranslationLang: string | null;
  onTranslationLangChange: (lang: string) => void;
  onTimeUpdate: (timeMs: number) => void;
  onSeekReady: (seekFn: (ms: number) => void) => void;
}

export default function Player({
  streamUrl,
  title,
  sourceLines,
  translationLines,
  translationLanguages,
  activeTranslationLang,
  onTranslationLangChange,
  onTimeUpdate,
  onSeekReady,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isHoveringPlayer, setIsHoveringPlayer] = useState(false);

  const { subtitleSettings, setSubtitleSettings } = useAppStore();

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
    onSeekReady((ms: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = ms / 1000;
      }
    });
  }, [onSeekReady]);

  useAnimationTick(
    () => {
      if (videoRef.current) {
        const ms = Math.floor(videoRef.current.currentTime * 1000);
        setCurrentTimeMs(ms);
        onTimeUpdate(ms);
      }
    },
    { autoStart: true },
  );

  useEffect(() => {
    if (!showSettings) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSettings]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl"
      onMouseEnter={() => setIsHoveringPlayer(true)}
      onMouseLeave={() => {
        setIsHoveringPlayer(false);
        setShowSettings(false);
      }}
    >
      <video ref={videoRef} title={title} playsInline>
        <source src={streamUrl} type="video/mp4" />
      </video>

      <SubtitleOverlay
        currentTimeMs={currentTimeMs}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={subtitleSettings}
      />

      {isHoveringPlayer && (
        <div className="absolute bottom-14 right-2 z-20">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="text-xs px-2 py-1 bg-background/80 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
          >
            Subtitles
          </button>
        </div>
      )}

      {showSettings && (
        <SubtitleSettingsPanel
          settings={subtitleSettings}
          translationLanguages={translationLanguages}
          activeTranslationLang={activeTranslationLang}
          onSettingsChange={setSubtitleSettings}
          onTranslationLangChange={(lang) => {
            onTranslationLangChange(lang);
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}
