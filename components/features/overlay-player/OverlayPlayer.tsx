"use client";

import { useState, useCallback } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { useAppStore } from "@/lib/initializations/store";
import PlayerSmall from "@/components/features/player/PlayerSmall";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import Link from "next/link";
import { SearchOverlayProvider } from "@/components/layout/SearchOverlayProvider";
import Header from "./Header";
import SearchResults from "./SearchResults";

export default function OverlayPlayer() {
  const { overlayOpen, setOverlayOpen } = useAppStore();
  const [selectedItem, setSelected] = useState<SubtitleSearchDocument | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const { preferredSourceLanguage, preferredTranslationLanguage } =
    useAppStore();

  const searchResult = useSearch({
    query: searchQuery,
    sourceLanguage: preferredSourceLanguage ?? "",
    translationLanguage: preferredTranslationLanguage ?? "",
    enabled: !!preferredSourceLanguage && !!preferredTranslationLanguage,
  });

  const streamData = useStreamUrl(selectedItem?.media_content_id ?? null);

  const OnSearchChange = useCallback((query: string) => {
    setSelected(null);
    setSearchQuery(query);
  }, []);

  return (
    <>
      <SearchOverlayProvider />
      <div
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all ${overlayOpen ? "h-full" : "h-0"} overflow-hidden`}
        data-testid={"close-button"}
        onClick={() => setOverlayOpen(false)}
      >
        <div
          className="flex flex-col h-full w-full p-6 gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Header
            isOverlayOpen={overlayOpen}
            isSearchLoading={searchResult.isLoading}
            onSearchQueryChange={OnSearchChange}
          />
          <div className="flex flex-1 gap-4 min-h-0">
            <div
              className={`${selectedItem && streamData.data ? "flex-3" : "flex-0"} transition-all min-w-0 bg-background relative overflow-hidden`}
            >
              {selectedItem && streamData.data ? (
                <>
                  <PlayerSmall
                    streamUrl={streamData.data.streamUrl}
                    mediaItem={selectedItem}
                  />
                  <Link
                    href={`/watch/${selectedItem.media_content_id}?t=${selectedItem.start_ms}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-background/80 border border-primary-border text-secondary-foreground hover:text-primary-foreground transition-colors"
                  >
                    Go to video ↗
                  </Link>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-secondary-foreground text-sm">
                  {selectedItem && streamData.isLoading
                    ? "Loading..."
                    : "Select a result to preview"}
                </div>
              )}
            </div>
            <SearchResults
              searchQuery={searchQuery}
              searchResults={searchResult}
              selectedItem={selectedItem}
              onSelect={setSelected}
            />
          </div>
        </div>
      </div>
    </>
  );
}
