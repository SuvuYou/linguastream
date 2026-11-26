"use client";

import type {
  Line,
  SubtitleVisibility,
  TrackVisibility,
} from "@linguastream/contracts";
import { cn } from "@/lib/utils";
import { activeIndex } from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";

function blurProps(visibility: TrackVisibility) {
  return visibility === "blur" ? { tabIndex: 0 } : {};
}

function blurClass(visibility: TrackVisibility) {
  return visibility === "blur"
    ? "group/sub pointer-events-auto cursor-default focus-visible:outline-2 focus-visible:outline-ring"
    : "";
}

function SubtitleText({
  visibility,
  children,
}: {
  visibility: TrackVisibility;
  children: React.ReactNode;
}) {
  if (visibility !== "blur") return children;
  return (
    <span
      data-blurred=""
      className="inline-block blur-[6px] transition-[filter] duration-150 group-hover/sub:blur-none group-focus-visible/sub:blur-none motion-reduce:transition-none"
    >
      {children}
    </span>
  );
}

export default function SubtitleLines({
  lines,
  clock,
  language,
  translationLanguage,
  visibility,
}: {
  lines: readonly Line[];
  clock: PlaybackClock;
  language: string;
  translationLanguage: string | null;
  visibility: SubtitleVisibility;
}) {
  const index = useClockValue(clock, (ms) => activeIndex(lines, ms));
  const line = index >= 0 ? lines[index] : undefined;
  if (!line) return null;
  const showOriginal = visibility.original !== "hide";
  const showTranslation =
    !!line.translation && visibility.translation !== "hide";
  if (!showOriginal && !showTranslation) return null;

  return (
    <div
      aria-live="off"
      className="pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-1.5 px-6 text-center @max-[600px]:px-3"
    >
      {showOriginal && (
        <p
          lang={language}
          {...blurProps(visibility.original)}
          className={cn(
            "rounded-md bg-subtitle-backing/78 px-4 py-1 text-[clamp(17px,5.4cqi,28px)] leading-normal font-semibold text-foreground",
            blurClass(visibility.original),
          )}
        >
          <SubtitleText visibility={visibility.original}>
            {line.text}
          </SubtitleText>
        </p>
      )}
      {showTranslation && (
        <p
          lang={translationLanguage ?? undefined}
          {...blurProps(visibility.translation)}
          className={cn(
            "rounded-md bg-subtitle-backing/60 px-3 py-1 text-[clamp(13px,3.8cqi,19px)] text-text-2",
            blurClass(visibility.translation),
          )}
        >
          <SubtitleText visibility={visibility.translation}>
            {line.translation}
          </SubtitleText>
        </p>
      )}
    </div>
  );
}
