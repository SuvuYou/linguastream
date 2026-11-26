"use client";

import type { Line, VideoDetail } from "@linguastream/contracts";
import { ArrowDownToLine, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  filterLines,
  formatTime,
  groupByMarker,
  lastStartedIndex,
} from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";
import TranscriptLine from "./TranscriptLine";

export const FOLLOW_PAUSE_MS = 5000;

type TrackState = "preparing" | "failed" | "loading" | "error" | "ready";

export function trackState(
  video: VideoDetail,
  lines: { isLoading: boolean; isError: boolean },
): TrackState {
  const status = video.track?.status;
  if (!status || status === "pending" || status === "processing")
    return "preparing";
  if (status === "failed") return "failed";
  if (lines.isLoading) return "loading";
  if (lines.isError) return "error";
  return "ready";
}

function Message({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col gap-1 px-5 py-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {children && <p className="text-[13px] text-text-3">{children}</p>}
    </div>
  );
}

export default function TranscriptPanel({
  video,
  lines,
  state,
  clock,
  onSeek,
}: {
  video: VideoDetail;
  lines: Line[];
  state: TrackState;
  clock: PlaybackClock;
  onSeek(ms: number): void;
}) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef(new Map<number, HTMLButtonElement>());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPos = useClockValue(clock, (ms) => lastStartedIndex(lines, ms));
  const currentIndex = currentPos >= 0 ? lines[currentPos]!.index : -1;
  const shown = useMemo(() => filterLines(lines, query), [lines, query]);
  const groups = useMemo(() => groupByMarker(shown), [shown]);
  const filtering = query.trim() !== "";
  const following = !filtering && pausedUntil === 0;

  const setRef = useCallback(
    (index: number, element: HTMLButtonElement | null) => {
      if (element) lineRefs.current.set(index, element);
      else lineRefs.current.delete(index);
    },
    [],
  );

  const scrollToCurrent = useCallback(() => {
    lineRefs.current
      .get(currentIndex)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    if (following) scrollToCurrent();
  }, [following, scrollToCurrent]);

  useEffect(() => {
    if (pausedUntil === 0) return;
    const timer = setTimeout(
      () => setPausedUntil(0),
      Math.max(0, pausedUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [pausedUntil]);

  const pauseFollowing = useCallback(
    () => setPausedUntil(Date.now() + FOLLOW_PAUSE_MS),
    [],
  );

  const seekTo = useCallback(
    (ms: number) => {
      setPausedUntil(0);
      onSeek(ms);
    },
    [onSeek],
  );

  const closeFilter = () => {
    setQuery("");
    setFilterOpen(false);
  };

  return (
    <aside
      aria-label="Transcript"
      className="relative flex min-h-0 flex-col overflow-hidden rounded-3xl bg-panel @max-[600px]:rounded-none"
    >
      <div className="flex items-center gap-1 px-2.5 pt-2.5 pb-2">
        <h2 className="flex h-[34px] items-center rounded-md bg-tab-on px-2 text-[13px] font-semibold text-accent-text">
          Transcript
        </h2>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          {state === "ready" && (
            <>
              <div className="relative h-[34px] min-w-0 flex-1 overflow-hidden">
                <div
                  inert={!filterOpen}
                  className={cn(
                    "absolute inset-0 transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
                    filterOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-full opacity-0",
                  )}
                >
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Escape" && closeFilter()
                    }
                    placeholder="Filter lines"
                    aria-label="Filter lines"
                    className={cn(
                      "h-[34px] w-full rounded-md bg-inset pl-3 text-[13px] text-foreground placeholder:text-text-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden",
                      filtering ? "pr-[4.5rem]" : "pr-3",
                    )}
                  />
                  {filtering && (
                    <span
                      aria-live="polite"
                      className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center font-mono text-[11px] text-text-3"
                    >
                      <span className="sr-only">
                        {shown.length} of {lines.length} lines
                      </span>
                      <span aria-hidden="true">
                        {shown.length}/{lines.length}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label={filterOpen ? "Close filter" : "Filter lines"}
                aria-expanded={filterOpen}
                onClick={() => {
                  if (filterOpen) closeFilter();
                  else {
                    setFilterOpen(true);
                    requestAnimationFrame(() =>
                      inputRef.current?.focus({ preventScroll: true }),
                    );
                  }
                }}
                className="relative flex h-[34px] w-[30px] shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Search
                  aria-hidden="true"
                  className={cn(
                    "absolute size-4 transition-[opacity,rotate] duration-200 motion-reduce:transition-none",
                    filterOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                  )}
                />
                <X
                  aria-hidden="true"
                  className={cn(
                    "absolute size-4 transition-[opacity,rotate] duration-200 motion-reduce:transition-none",
                    filterOpen
                      ? "rotate-0 opacity-100"
                      : "-rotate-90 opacity-0",
                  )}
                />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={listRef}
        onWheel={pauseFollowing}
        onTouchMove={pauseFollowing}
        onKeyDown={(event) =>
          [
            "PageUp",
            "PageDown",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ].includes(event.key) && pauseFollowing()
        }
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 pb-2 [scrollbar-color:var(--raised-2)_transparent] [scrollbar-width:thin]"
      >
        {state === "preparing" && (
          <Message title="Preparing the transcript">
            Sentences, translation and word data are on their way. The video
            plays meanwhile.
          </Message>
        )}
        {state === "failed" && (
          <Message title="Couldn't prepare this transcript">
            Send the video again from YouTube to retry.
          </Message>
        )}
        {state === "error" && (
          <Message title="Couldn't load the transcript">
            Reload the page to try again.
          </Message>
        )}
        {state === "loading" && (
          <div className="flex flex-col gap-3 px-3 py-3" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-[85%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
            ))}
          </div>
        )}
        {state === "ready" && lines.length === 0 && (
          <Message title="This transcript has no lines" />
        )}
        {state === "ready" && filtering && shown.length === 0 && (
          <Message title={`No lines match "${query.trim()}"`} />
        )}
        {state === "ready" &&
          groups.map((group) => {
            const isCurrentGroup = group.lines.some(
              (line) => line.index === currentIndex,
            );
            return (
              <section
                key={group.markerMs}
                aria-label={formatTime(group.markerMs)}
              >
                <div
                  className="flex items-center gap-2 px-3 pt-3 pb-1"
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      "font-mono text-[11px] text-text-3",
                      isCurrentGroup && "text-accent-text",
                    )}
                  >
                    {formatTime(group.markerMs)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                {group.lines.map((line) => (
                  <TranscriptLine
                    key={line.index}
                    line={line}
                    state={
                      line.index === currentIndex
                        ? "current"
                        : line.index < currentIndex
                          ? "past"
                          : "upcoming"
                    }
                    language={video.language}
                    translationLanguage={video.translation_language}
                    onSeek={seekTo}
                    setRef={setRef}
                  />
                ))}
              </section>
            );
          })}
      </div>

      {state === "ready" &&
        !filtering &&
        pausedUntil !== 0 &&
        currentIndex >= 0 && (
          <button
            type="button"
            onClick={() => {
              setPausedUntil(0);
              scrollToCurrent();
            }}
            className="absolute bottom-4 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full bg-popup px-3 text-[13px] text-foreground shadow-float backdrop-blur-sm transition-colors hover:bg-raised-2 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowDownToLine className="size-3.5" />
            Back to current line
          </button>
        )}
    </aside>
  );
}
