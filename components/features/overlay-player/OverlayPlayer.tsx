"use client";

import { useRef, useState, useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { useAppStore } from "@/lib/initializations/store";
import PlayerSmall from "@/components/features/player/PlayerSmall";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import Link from "next/link";
import Events from "@/events";
import { useSearchOverlay } from "@/hooks/useSearchOverlay";

function msToSubtitleLine(
  text: string,
  start_ms: number,
  end_ms: number,
): SubtitleLine {
  return { index: 0, text, start_ms, end_ms };
}

export default function OverlayPlayer() {
  const { isOpen, close } = useSearchOverlay();

  const [selected, setSelected] = useState<SubtitleSearchDocument | null>(null);
  const [visualQuery, setVisualQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    autoPlay,
    setAutoPlay,
    preferredSourceLanguage,
    preferredTranslationLanguage,
  } = useAppStore();

  const searchResult = useSearch({
    query: searchQuery,
    sourceLanguage: preferredSourceLanguage ?? "",
    translationLanguage: preferredTranslationLanguage ?? "",
    enabled: !!preferredSourceLanguage && !!preferredTranslationLanguage,
  });

  const streamData = useStreamUrl(selected?.media_content_id ?? null);

  const items = searchResult.data?.results ?? [];

  useEffect(() => {
    inputRef.current?.focus();

    const onOverlay = ({ isOpen }: { isOpen: boolean }) => {
      if (!isOpen) {
        setSelected(null);
        setVisualQuery("");
        setSearchQuery("");
      }
    };

    const unsubscribe = Events.overlay.onOverlay(onOverlay);

    return () => unsubscribe();
  }, [isOpen]);

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualQuery(e.target.value);
    setSelected(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSearchQuery(e.target.value);
    }, 300);
  };

  const sourceLine = selected
    ? msToSubtitleLine(selected.source_text, selected.start_ms, selected.end_ms)
    : null;

  const translationLine =
    selected &&
    preferredTranslationLanguage &&
    selected.translation_language === preferredTranslationLanguage
      ? msToSubtitleLine(
          selected.translation_text,
          selected.start_ms,
          selected.end_ms,
        )
      : null;

  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);

    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all ${isOpen ? "h-full" : "h-0"} overflow-hidden`}
      onClick={close}
    >
      <div
        className="flex flex-col h-full w-full p-6 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 shrink-0">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search word uses across your library..."
            value={visualQuery}
            onChange={handleChangeQuery}
            className={`flex-1 bg-transparent border-b border-primary-border focus:border-active-border outline-none py-2 px-1 text-primary-text transition-colors ${
              searchResult.isLoading ? "opacity-50" : "opacity-100"
            }`}
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-secondary-text">Auto-play</span>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                autoPlay ? "bg-active-border" : "bg-primary-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all ${
                  autoPlay ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <button
            onClick={close}
            className="text-secondary-text hover:text-primary-text transition-colors shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 gap-4 min-h-0">
          <div
            className={`${selected && streamData.data ? "flex-3" : "flex-0"} transition-all min-w-0 bg-black relative overflow-hidden`}
          >
            {selected && streamData.data ? (
              <>
                <PlayerSmall
                  streamUrl={streamData.data.streamUrl}
                  title={selected.media_title}
                  sourceLine={sourceLine}
                  translationLine={translationLine}
                  startMs={selected.start_ms}
                  endMs={selected.end_ms}
                  autoPlay={autoPlay}
                />
                <Link
                  href={`/watch/${selected.media_content_id}?t=${selected.start_ms}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 text-xs px-2 py-1 bg-background/80 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                >
                  Go to video ↗
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary-text text-sm">
                {selected && streamData.isLoading
                  ? "Loading..."
                  : "Select a result to preview"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto flex flex-col gap-1">
            {!searchQuery.trim() ? (
              <div className="flex items-center justify-center h-full text-secondary-text text-sm">
                Start typing to search
              </div>
            ) : searchResult.isLoading ? (
              <div className="flex items-center justify-center h-full text-secondary-text text-sm">
                Searching...
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-secondary-text text-sm">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              items.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`w-full text-left p-3 border transition-colors ${
                      isSelected
                        ? "border-active-border bg-background-hover"
                        : "border-primary-border hover:bg-background-hover"
                    }`}
                  >
                    <div className="text-xs text-secondary-text mb-1 flex items-center justify-between">
                      <span className="truncate">{item.media_title}</span>
                      <span className="tabular-nums ml-2 shrink-0">
                        {formatTime(item.start_ms)}
                      </span>
                    </div>
                    <div className="text-sm text-primary-text leading-snug">
                      {item.source_text}
                    </div>
                    {item.translation_text && (
                      <div className="text-xs text-secondary-text mt-0.5 leading-snug">
                        {item.translation_text}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
