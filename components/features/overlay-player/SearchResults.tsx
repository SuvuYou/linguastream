"use client";

import { UseQueryResult } from "@tanstack/react-query";
import type { SearchResponse } from "@/types/search";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);

  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

interface SearchResultsProps {
  searchQuery: string;
  searchResults: UseQueryResult<SearchResponse, Error>;
  selectedItem: SubtitleSearchDocument | null;
  onSelect: (item: SubtitleSearchDocument) => void;
}

export default function SearchResults({
  searchQuery,
  searchResults,
  selectedItem,
  onSelect,
}: SearchResultsProps) {
  const items = searchResults.data?.results ?? [];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto flex flex-col gap-1">
      {!searchQuery.trim() ? (
        <div className="flex items-center justify-center h-full text-secondary-foreground text-sm">
          Start typing to search
        </div>
      ) : searchResults.isLoading ? (
        <div className="flex items-center justify-center h-full text-secondary-foreground text-sm">
          Searching...
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-full text-secondary-foreground text-sm">
          No results for &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        items.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 border transition-colors ${
                isSelected
                  ? "border-active-border bg-background-hover"
                  : "border-primary-border hover:bg-background-hover"
              }`}
            >
              <div className="text-xs text-secondary-foreground mb-1 flex items-center justify-between">
                <span className="truncate">{item.media_title}</span>
                <span className="tabular-nums ml-2 shrink-0">
                  {formatTime(item.start_ms)}
                </span>
              </div>
              <div className="text-sm text-primary-foreground leading-snug">
                {item.source_text}
              </div>
              {item.translation_text && (
                <div className="text-xs text-secondary-foreground mt-0.5 leading-snug">
                  {item.translation_text}
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
