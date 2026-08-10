"use client";

import { UseQueryResult } from "@tanstack/react-query";
import type { SearchResponse } from "@/types/search";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
  useMemo,
} from "react";

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
  const items = useMemo(
    () => searchResults.data?.results ?? [],
    [searchResults.data?.results],
  );

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setFocusedIndex(null);
    });
  }, [searchQuery]);

  useEffect(() => {
    if (focusedIndex === null) return;
    const el = itemRefs.current.get(focusedIndex);

    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === null ? 0 : Math.min(prev + 1, items.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === null ? items.length - 1 : Math.max(prev - 1, 0),
        );
      } else if (e.key === "Enter" && focusedIndex !== null) {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item) onSelect(item);
      }
    },
    [items, focusedIndex, onSelect],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!searchQuery.trim()) {
    return (
      <Empty className="flex-1 h-full justify-center">
        <EmptyHeader>
          <EmptyTitle className="text-sm font-normal text-secondary-foreground">
            Start typing to search
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (searchResults.isLoading || searchResults.isFetching) {
    return (
      <Empty className="flex-1 h-full justify-center">
        <EmptyHeader>
          <EmptyTitle className="text-sm font-normal text-secondary-foreground">
            <span className="flex items-center gap-2">
              <Spinner className="size-4" />
              Searching...
            </span>
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (items.length === 0) {
    return (
      <Empty className="flex-1 h-full justify-center">
        <EmptyHeader>
          <EmptyTitle className="text-sm font-normal text-secondary-foreground">
            No results for &ldquo;{searchQuery}&rdquo;
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${(searchResults.data?.totalPages ?? 0) > 1 ? "h-[calc(100dvh-168px)]" : "h-full"} overflow-y-scroll flex flex-col gap-1 outline-none focus:ring-1 focus:ring-primary/20`}
      role="listbox"
      aria-label="Search results"
      aria-activedescendant={
        focusedIndex !== null ? `search-result-${focusedIndex}` : undefined
      }
    >
      {items.map((item, i) => {
        const isSelected = selectedItem?.id === item.id;
        const isFocused = focusedIndex === i;

        return (
          <Item
            key={item.id}
            id={`search-result-${i}`}
            role="option"
            aria-selected={isSelected}
            ref={(el) => {
              if (el) itemRefs.current.set(i, el);
              else itemRefs.current.delete(i);
            }}
            variant="default"
            onClick={() => {
              setFocusedIndex(i);
              onSelect(item);
            }}
            className={cn(
              "group/result-item rounded-xl rounded-bl-xs border-2 border-b-2 border-transparent border-b-border cursor-pointer w-full text-left hover:bg-card",
              isSelected &&
                "bg-primary/5 hover:bg-primary/10 border-primary/50",
              isFocused && !isSelected && "bg-card",
              isFocused && isSelected && "bg-primary/10",
            )}
          >
            <ItemContent className="max-w-full">
              <div className="flex items-center justify-between mb-1">
                <ItemDescription className="truncate whitespace-nowrap! text-sm text-primary-foreground">
                  {item.media_title}
                </ItemDescription>
                <span className="tabular-nums ml-4 shrink-0 text-sm text-primary-foreground">
                  {formatTime(item.start_ms)}
                </span>
              </div>
              <ItemTitle
                className={cn(
                  "text-base text-primary-foreground leading-snug font-normal",
                  isSelected && "font-semibold",
                )}
              >
                {item.source_text}
              </ItemTitle>
              {item.translation_text && (
                <ItemDescription
                  className={cn(
                    "text-sm text-primary-foreground/50 mt-0.5 leading-snug group-hover/result-item:text-primary-foreground",
                    isSelected &&
                      "text-primary group-hover/result-item:text-primary",
                    isFocused &&
                      !isSelected &&
                      "text-primary-foreground group-hover/result-item:text-primary",
                  )}
                >
                  {item.translation_text}
                </ItemDescription>
              )}
            </ItemContent>
          </Item>
        );
      })}
    </div>
  );
}
