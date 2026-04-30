"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import type { SubtitleSettings } from "@/lib/initializations/store";

interface SubtitleSidebarProps {
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  settings: SubtitleSettings;
  onSeek: (timeMs: number) => void;
}

const RESUME_AUTOSCROLL_DELAY_MS = 3000;

export default function SubtitleSidebar({
  currentTimeMs,
  sourceLines,
  translationLines,
  settings,
  onSeek,
}: SubtitleSidebarProps) {
  const [query, setQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrollingRef = useRef(false);

  const showSource = settings.showSource && sourceLines.length > 0;
  const showTranslation =
    settings.showTranslation && translationLines.length > 0;

  const pairs = useMemo(() => {
    const maxLen = Math.max(sourceLines.length, translationLines.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      source: sourceLines[i] ?? null,
      translation: translationLines[i] ?? null,
      start_ms: sourceLines[i]?.start_ms ?? translationLines[i]?.start_ms ?? 0,
      end_ms: sourceLines[i]?.end_ms ?? translationLines[i]?.end_ms ?? 0,
      index: i,
    }));
  }, [sourceLines, translationLines]);

  const activePairIndex = useMemo(() => {
    for (let i = 0; i < pairs.length; i++) {
      if (
        currentTimeMs >= pairs[i].start_ms &&
        currentTimeMs <= pairs[i].end_ms
      )
        return i;
    }
    return null;
  }, [pairs, currentTimeMs]);

  const filteredPairs = useMemo(() => {
    if (!query.trim()) return pairs;

    const q = query.toLowerCase();
    return pairs.filter((pair) => {
      if (showSource && pair.source?.text.toLowerCase().includes(q))
        return true;

      if (showTranslation && pair.translation?.text.toLowerCase().includes(q))
        return true;

      return false;
    });
  }, [pairs, query, showSource, showTranslation]);

  useEffect(() => {
    if (!autoScroll || activePairIndex === null || query.trim()) return;
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activePairIndex, autoScroll, query]);

  const handleScroll = useCallback(() => {
    if (isUserScrollingRef.current) return;

    isUserScrollingRef.current = true;
    setAutoScroll(false);

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    resumeTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      setAutoScroll(true);
    }, RESUME_AUTOSCROLL_DELAY_MS);
  }, []);

  function highlight(text: string, q: string) {
    if (!q.trim()) return <span>{text}</span>;

    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;

    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-active-border/40 text-primary-text rounded-sm">
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

  const nothingVisible = !showSource && !showTranslation;

  return (
    <div className="flex flex-col border-l border-primary-border h-full min-h-0 flex-1">
      <div className="px-3 py-2 border-b border-primary-border shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subtitles..."
          className="w-full bg-transparent text-sm text-primary-text placeholder-secondary-text outline-none"
        />
      </div>

      <div className="px-3 py-1.5 border-b border-primary-border shrink-0 flex items-center justify-between">
        <span className="text-xs text-secondary-text">
          {query.trim()
            ? `${filteredPairs.length} result${filteredPairs.length !== 1 ? "s" : ""}`
            : `${pairs.length} lines`}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0"
      >
        {nothingVisible ? (
          <div className="p-6 text-center text-xs text-secondary-text">
            All subtitle tracks are hidden.
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="p-6 text-center text-xs text-secondary-text">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          filteredPairs.map((pair) => {
            const isActive = pair.index === activePairIndex;
            return (
              <div
                key={pair.index}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(pair.start_ms)}
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
                <div className="text-xs text-secondary-text mb-1 tabular-nums">
                  {formatTime(pair.start_ms)}
                </div>

                {showSource && pair.source && (
                  <div className="text-sm text-primary-text leading-snug">
                    {highlight(pair.source.text, query)}
                  </div>
                )}

                {showTranslation && pair.translation && (
                  <div
                    className={`text-xs text-secondary-text leading-snug ${
                      showSource && pair.source ? "mt-0.5" : ""
                    }`}
                  >
                    {highlight(pair.translation.text, query)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
