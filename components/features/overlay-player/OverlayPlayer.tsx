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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useOverlayLanguages } from "@/hooks/useOverlayLanguages";
import YouTubePlayerSmall from "../player/YouTubePlayerSmall";
import PaginationControls from "@/components/primitives/PaginationControls";

export default function OverlayPlayer() {
  const { overlayOpen, setOverlayOpen } = useAppStore();
  const [selectedItem, setSelected] = useState<SubtitleSearchDocument | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const languages = useOverlayLanguages();

  const searchResult = useSearch({
    page,
    limit: 30,
    query: searchQuery,
    sourceLanguage: languages.source.value ?? "",
    translationLanguage: languages.translation.value ?? "",
    enabled: !!languages.source.value && !!languages.translation.value,
  });

  const streamData = useStreamUrl(
    selectedItem?.media_content_id ?? null,
    !!selectedItem?.media_content_id && !selectedItem.youtube_video_id,
  );

  const OnSearchChange = useCallback((query: string) => {
    setSelected(null);
    setSearchQuery(query);
    setPage(0);
  }, []);

  const isPlayerVisible =
    selectedItem && (streamData.data || selectedItem.youtube_video_id);

  return (
    <>
      <SearchOverlayProvider />

      <Sheet open={overlayOpen} onOpenChange={setOverlayOpen}>
        <SheetContent
          side="top"
          className="h-screen w-screen p-6 gap-4 flex flex-col border-none bg-background/80 backdrop-blur-sm inset-0"
        >
          <SheetTitle className="sr-only">
            Video Search Player Overlay
          </SheetTitle>

          <Header
            source={languages.source}
            translation={languages.translation}
            isLoading={languages.isLoading || languages.isFetching}
            isError={languages.isError}
            isOverlayOpen={overlayOpen}
            isSearchLoading={searchResult.isLoading}
            onSearchQueryChange={OnSearchChange}
          />
          <div className="flex flex-1 gap-4 min-h-0">
            <div
              className={`${
                isPlayerVisible ? "flex-3" : "flex-0 border-0"
              } transition-all min-w-0 bg-background border rounded-lg relative overflow-hidden`}
            >
              {isPlayerVisible ? (
                <>
                  {selectedItem.youtube_video_id ? (
                    <YouTubePlayerSmall
                      videoId={selectedItem.youtube_video_id}
                      mediaItem={selectedItem}
                    />
                  ) : (
                    <PlayerSmall
                      streamUrl={streamData.data!.streamUrl}
                      mediaItem={selectedItem}
                    />
                  )}
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border"
                  >
                    <Link
                      href={`/watch/${selectedItem.media_content_id}?t=${selectedItem.start_ms}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Go to video ↗
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  {selectedItem && streamData.isLoading ? (
                    <>
                      <Spinner className="h-6 w-6 text-primary-foreground" />
                      <span>Loading stream preview...</span>
                    </>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No preview active</EmptyTitle>
                        <EmptyDescription>
                          Select a result to preview.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <SearchResults
                searchQuery={searchQuery}
                searchResults={searchResult}
                selectedItem={selectedItem}
                onSelect={setSelected}
              />
            </div>
          </div>
          {(searchResult.data?.totalPages ?? 0) > 1 ? (
            <div className="pt-4">
              <PaginationControls
                page={page}
                onPageChange={setPage}
                pageCount={searchResult.data?.totalPages ?? 0}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
