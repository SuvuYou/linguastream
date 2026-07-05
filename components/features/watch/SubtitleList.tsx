"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import Events from "@/events";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

interface SubtitleListProps {
  query: string;
  currentTimeMs: number;
  subtitlePairs: SubtitleLinePair[];
  filteredSubtitlePairs: SubtitleLinePair[];
  shouldShowSourceLine: boolean;
  shouldShowTranslationLine: boolean;
}

interface SubtitleLinePair {
  source: SubtitleLine;
  translation: SubtitleLine;
  start_ms: number;
  end_ms: number;
  index: number;
}

const RESUME_AUTOSCROLL_DELAY_MS = 3000;
const SCROLL_INTO_VIEW_MS = 500;

function highlight(text: string, q: string) {
  if (!q.trim()) return <span>{text}</span>;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-active-border/40 text-primary-foreground rounded-sm">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  );
}

function formatTime(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;

  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SubtitleList({
  query,
  currentTimeMs,
  subtitlePairs,
  filteredSubtitlePairs,
  shouldShowSourceLine,
  shouldShowTranslationLine,
}: SubtitleListProps) {
  const shouldScrollSyncWithVideo = useRef(true);
  const isScrollingIntoView = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isScrollingIntoViewTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const activePairIndex = useMemo(() => {
    for (let i = 0; i < subtitlePairs.length; i++) {
      if (
        currentTimeMs >= subtitlePairs[i].start_ms &&
        currentTimeMs <= subtitlePairs[i].end_ms
      )
        return i;
    }
    return null;
  }, [subtitlePairs, currentTimeMs]);

  useEffect(() => {
    if (
      !shouldScrollSyncWithVideo.current ||
      activePairIndex === null ||
      query.trim()
    )
      return;

    if (activeRef.current && scrollRef.current) {
      isScrollingIntoView.current = true;
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });

      if (isScrollingIntoViewTimerRef.current)
        clearTimeout(isScrollingIntoViewTimerRef.current);

      isScrollingIntoViewTimerRef.current = setTimeout(() => {
        isScrollingIntoView.current = false;
      }, SCROLL_INTO_VIEW_MS);
    }
  }, [activePairIndex, query]);

  const handleScroll = useCallback(() => {
    // We need to distinguish between user-initiated scrolls and programmatic scrolls (e.g., when we call `scrollIntoView`)
    if (isScrollingIntoView.current) return;

    shouldScrollSyncWithVideo.current = false;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    resumeTimerRef.current = setTimeout(() => {
      shouldScrollSyncWithVideo.current = true;
    }, RESUME_AUTOSCROLL_DELAY_MS);
  }, []);

  if (!shouldShowSourceLine && !shouldShowTranslationLine) {
    return (
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyTitle className="text-xs font-normal text-secondary-foreground">
            All subtitle tracks are hidden.
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (filteredSubtitlePairs.length === 0) {
    return (
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyTitle className="text-xs font-normal text-secondary-foreground">
            No results for &ldquo;{query}&rdquo;
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto min-h-0 h-full"
    >
      {filteredSubtitlePairs.map((pair) => {
        const isActive = pair.index === activePairIndex;

        return (
          <div
            key={pair.index}
            ref={isActive ? activeRef : undefined}
            onClick={() => Events.player.triggerJumpTo(pair.start_ms)}
            className={`
                  px-3 py-2.5 cursor-pointer border-b border-primary-border/50
                  transition-colors hover:bg-background-hover
                  ${
                    isActive
                      ? "border-l-2 border-l-active-border bg-background-hover"
                      : "border-l-2 border-l-transparent"
                  }
                `}
          >
            <div className="text-xs text-secondary-foreground mb-1 tabular-nums">
              {formatTime(pair.start_ms)}
            </div>

            {shouldShowSourceLine && pair.source && (
              <div className="text-sm text-primary-foreground leading-snug">
                {highlight(pair.source.text, query)}
              </div>
            )}

            {shouldShowTranslationLine && pair.translation && (
              <div
                className={`text-xs text-secondary-foreground leading-snug ${
                  shouldShowSourceLine && pair.source ? "mt-0.5" : ""
                }`}
              >
                {highlight(pair.translation.text, query)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
