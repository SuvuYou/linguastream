"use client";

import type { Line } from "@linguastream/contracts";
import type { RefObject } from "react";
import type { PlayerStatus } from "@/hooks/useVideoPlayer";
import type { PlaybackClock } from "@/lib/watch/playback-clock";
import SubtitleLines from "./SubtitleLines";

export default function VideoStage({
  hostRef,
  status,
  lines,
  clock,
  language,
  translationLanguage,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  status: PlayerStatus;
  lines: readonly Line[];
  clock: PlaybackClock;
  language: string;
  translationLanguage: string | null;
}) {
  return (
    <div className="@container relative mx-auto aspect-video w-full max-w-[calc((100dvh-11rem)*16/9)] overflow-hidden rounded-3xl bg-inset @max-[600px]:max-w-none @max-[600px]:rounded-none">
      <div ref={hostRef} className="absolute inset-0 [&_iframe]:size-full" />
      {status === "loading" && (
        <div
          className="absolute inset-0 animate-pulse bg-raised"
          aria-hidden="true"
        />
      )}
      {status === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-text-2"
        >
          This video can&apos;t play here. The transcript still works.
        </div>
      )}
      <SubtitleLines
        lines={lines}
        clock={clock}
        language={language}
        translationLanguage={translationLanguage}
      />
    </div>
  );
}
