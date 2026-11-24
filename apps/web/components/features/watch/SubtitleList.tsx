"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody } from "@/components/ui/table";
import SubtitleRow from "@/components/features/watch/SubtitleRow";
import SubtitleListSkeleton from "./SubtitleListSkeleton";

interface SubtitleListProps {
  query: string;
  currentTimeMs: number;
  subtitlePairs: SubtitleLinePair[];
  filteredSubtitlePairs: SubtitleLinePair[];
  shouldShowSourceLine: boolean;
  shouldShowTranslationLine: boolean;
  isLoading: boolean;
}

export interface SubtitleLinePair {
  source: SubtitleLine;
  translation: SubtitleLine;
  start_ms: number;
  end_ms: number;
  index: number;
}

const RESUME_AUTOSCROLL_DELAY_MS = 3000;
const SCROLL_INTO_VIEW_MS = 500;

export default function SubtitleList({
  query,
  currentTimeMs,
  subtitlePairs,
  filteredSubtitlePairs,
  shouldShowSourceLine,
  shouldShowTranslationLine,
  isLoading,
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

  if (isLoading) {
    return <SubtitleListSkeleton />;
  }

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
      <Table className="w-full table-fixed border-separate border-spacing-y-2 box-border">
        <TableBody>
          {filteredSubtitlePairs.map((pair, i) => {
            const isActive = pair.index === activePairIndex;

            return (
              <SubtitleRow
                key={pair.index}
                forwardActiveRef={activeRef}
                query={query}
                listOrderIndex={i}
                subtitlePair={pair}
                isActive={isActive}
                shouldShowSourceLine={shouldShowSourceLine}
                shouldShowTranslationLine={shouldShowTranslationLine}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
