"use client";

import type { Line } from "@linguastream/contracts";
import { activeIndex } from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";

export default function SubtitleLines({
  lines,
  clock,
  language,
  translationLanguage,
}: {
  lines: readonly Line[];
  clock: PlaybackClock;
  language: string;
  translationLanguage: string | null;
}) {
  const index = useClockValue(clock, (ms) => activeIndex(lines, ms));
  const line = index >= 0 ? lines[index] : undefined;
  if (!line) return null;

  return (
    <div
      aria-live="off"
      className="pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-1.5 px-6 text-center @max-[600px]:px-3"
    >
      <p
        lang={language}
        className="rounded-md bg-subtitle-backing/78 px-4 py-1 text-[clamp(17px,5.4cqi,28px)] leading-normal font-semibold text-foreground"
      >
        {line.text}
      </p>
      {line.translation && (
        <p
          lang={translationLanguage ?? undefined}
          className="rounded-md bg-subtitle-backing/60 px-3 py-1 text-[clamp(13px,3.8cqi,19px)] text-text-2"
        >
          {line.translation}
        </p>
      )}
    </div>
  );
}
