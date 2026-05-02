"use client";

import { useSearch } from "@/hooks/useSearch";
import { useRef, useState } from "react";
import { useWatchData } from "@/hooks/useWatchData";
import PlayerSmall from "../player/PlayerSmall";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";

export default function OverlayPlayer() {
  const [selectedMediaContent, setSelectedMediaContent] =
    useState<SubtitleSearchDocument | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [visualQuery, setVisualQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debounce = useRef<NodeJS.Timeout | null>(null);

  const searchResult = useSearch({
    query: searchQuery,
    sourceLanguage: "en",
  });

  const watchData = useWatchData(
    selectedMediaContent?.media_content_id || "",
    !!selectedMediaContent?.media_content_id,
  );

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualQuery(e.target.value);

    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(() => {
      setSearchQuery(e.target.value);
    }, 300);
  };

  const items = searchResult.data?.results ?? [];

  const selectItem = (item: SubtitleSearchDocument) => {
    setSelectedMediaContent(item);
    setCurrentTimeMs(item.start_ms);
  };

  return (
    <section className="fixed inset-0 z-50 h-screen bg-background/70 transition-all">
      <div className="grid place-items-center grid-cols-[4fr_1fr] grid-rows-[auto_1fr] max-md:grid-cols-[1fr] max-md:grid-rows-[auto_repeat(2,1fr)] max-md:overflow-y-scroll gap-4 h-full w-full p-16">
        <div className="col-span-2 max-md:col-span-1 bg-background w-full">
          <input
            type="text"
            placeholder="Search word uses..."
            value={visualQuery}
            onChange={handleChangeQuery}
            className={`w-full outline-none bg-transparent border-b border-primary-border focus:border-active-border transition-colors py-2 px-4 ${searchResult.isLoading ? "opacity-50" : "opacity-100"}`}
          />
        </div>
        <div className="bg-red-200 h-full w-full min-h-40">
          {watchData.data && (
            <PlayerSmall
              streamUrl={watchData.data.streamUrl}
              title={watchData.data.title}
              sourceLine={{
                index: 1,
                start_ms: selectedMediaContent?.start_ms || 1,
                end_ms: selectedMediaContent?.end_ms || 1,
                text: selectedMediaContent?.source_text || "",
              }}
              translationLine={{
                index: 1,
                start_ms: selectedMediaContent?.start_ms || 1,
                end_ms: selectedMediaContent?.end_ms || 1,
                text: selectedMediaContent?.translation_text || "",
              }}
              currentTimeMs={currentTimeMs}
              setCurrentTimeMs={setCurrentTimeMs}
            />
          )}
        </div>
        <div className="bg-red-400 h-full w-full min-h-40">
          <div className="flex flex-col">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => selectItem(item)}
                className="bg-background border border-primary-border p-4"
              >
                <h3 className="font-bold text-lg  text-primary-text">
                  {item.media_title}
                </h3>
                <p className="text-muted-foreground pt-2">{item.source_text}</p>
                <p className="text-muted-foreground pt-2">
                  {item.translation_text}
                </p>
                <p className="text-sm text-muted-foreground pt-2 text-active-border">
                  {item.source_language}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
