"use client";

import type {
  Line,
  SubtitleVisibility,
  TrackVisibility,
  WordStatus,
} from "@linguastream/contracts";
import { Pause } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { activeIndex } from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";
import {
  splitToken,
  statusOf,
  type WordStatuses,
  type WordTarget,
} from "@/lib/watch/words";

export interface SubtitleWordActions {
  statuses: WordStatuses | undefined;
  selected: WordTarget | null;
  pausedForWord: boolean;
  onSelect(target: WordTarget, element: HTMLElement): void;
  onCycle(lemma: string): void;
}

const COLOURED: Partial<Record<WordStatus, string>> = {
  unknown: "bg-unknown text-unknown-ink",
  learning: "bg-learning text-learning-ink",
};

function SubtitleWords({
  line,
  words,
}: {
  line: Line;
  words: SubtitleWordActions;
}) {
  if (line.words.length === 0) return line.text;
  const last = line.words.length - 1;
  return line.words.map((word, n) => {
    const space = n < last ? " " : "";
    const lemma = word.lemma;
    if (!lemma)
      return (
        <Fragment key={word.i}>
          {word.text}
          {space}
        </Fragment>
      );
    const { before, core, after } = splitToken(word.text);
    const status = statusOf(words.statuses, lemma);
    const colour = status ? COLOURED[status] : undefined;
    const selected =
      words.selected?.index === line.index && words.selected.i === word.i;
    return (
      <Fragment key={word.i}>
        {before}
        <button
          type="button"
          data-word=""
          aria-haspopup="dialog"
          aria-expanded={selected}
          onClick={(event) =>
            words.onSelect(
              { index: line.index, i: word.i, lemma },
              event.currentTarget,
            )
          }
          onContextMenu={(event) => {
            event.preventDefault();
            words.onCycle(lemma);
          }}
          className={cn(
            "pointer-events-auto cursor-pointer rounded-xs px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
            !colour && "-mx-1",
            selected
              ? "bg-primary text-primary-foreground"
              : (colour ?? "hover:bg-raised-2"),
          )}
        >
          {core}
        </button>
        {after}
        {space}
      </Fragment>
    );
  });
}

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
  words,
}: {
  lines: readonly Line[];
  clock: PlaybackClock;
  language: string;
  translationLanguage: string | null;
  visibility: SubtitleVisibility;
  words: SubtitleWordActions;
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
      {words.pausedForWord && (
        <span className="flex items-center gap-1.5 rounded-full bg-glass px-2.5 py-1 text-xs text-text-2 backdrop-blur-[16px]">
          <Pause className="size-3.5" aria-hidden="true" />
          Paused while you read
        </span>
      )}
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
            <SubtitleWords line={line} words={words} />
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
