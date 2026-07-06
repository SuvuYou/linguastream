"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import Events from "@/events";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
      <mark className="bg-highlight/40 p-1 rounded-[6px] text-primary-foreground">
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLTableRowElement>(null);
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
    if (!shouldScrollSyncWithVideo.current) return;
    if (query.trim()) return;
    if (
      !activeRef.current ||
      !scrollContainerRef.current ||
      activePairIndex === null
    )
      return;

    isScrollingIntoView.current = true;
    activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });

    if (isScrollingIntoViewTimerRef.current)
      clearTimeout(isScrollingIntoViewTimerRef.current);

    isScrollingIntoViewTimerRef.current = setTimeout(() => {
      isScrollingIntoView.current = false;
    }, SCROLL_INTO_VIEW_MS);

    return () => {
      if (isScrollingIntoViewTimerRef.current)
        clearTimeout(isScrollingIntoViewTimerRef.current);
    };
  }, [activePairIndex, query]);

  const handleScroll = useCallback(() => {
    // We need to distinguish between user-initiated scrolls and programmatic scrolls (e.g., when we call `scrollIntoView`)
    if (isScrollingIntoView.current) return;

    shouldScrollSyncWithVideo.current = false;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    resumeTimerRef.current = setTimeout(() => {
      shouldScrollSyncWithVideo.current = true;
    }, RESUME_AUTOSCROLL_DELAY_MS);

    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
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
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-scroll min-h-0 h-full outline-none"
      role="listbox"
      aria-label="Subtitle lines"
    >
      <Table className="w-full table-fixed border-spacing-y-4">
        <TableBody>
          {filteredSubtitlePairs.map((pair, i) => {
            const isActive = pair.index === activePairIndex;

            return (
              <TableRow
                key={pair.index}
                id={`subtitle-row-${i}`}
                role="option"
                ref={isActive ? activeRef : undefined}
                onClick={() => Events.player.triggerJumpTo(pair.start_ms)}
                className={cn(
                  "border-none overflow-hidden cursor-pointer transition-colors hover:bg-background",
                  isActive && "bg-background",
                )}
              >
                <TableCell className="w-16 pr-2 pl-5 py-4 align-top text-xs leading-6 text-primary-foreground tabular-nums rounded-l-sm whitespace-nowrap truncate">
                  {formatTime(pair.start_ms)}
                </TableCell>

                <TableCell className="pl-0 pr-3 py-4 align-top rounded-r-sm">
                  {shouldShowSourceLine && pair.source && (
                    <div className="text-base text-primary-foreground whitespace-nowrap truncate mb-2">
                      {highlight(pair.source.text, query)}
                    </div>
                  )}
                  {shouldShowTranslationLine && pair.translation && (
                    <div
                      className={cn(
                        "text-sm text-primary/70 whitespace-nowrap truncate",
                        shouldShowSourceLine && pair.source && "mt-0.5",
                      )}
                    >
                      {highlight(pair.translation.text, query)}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
