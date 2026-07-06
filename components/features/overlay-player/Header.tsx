"use client";

import { useRef, useState, useEffect, startTransition } from "react";
import { useAppStore } from "@/lib/initializations/store";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import { useOverlayLanguages } from "@/hooks/useOverlayLanguages";

interface HeaderProps {
  isOverlayOpen: boolean;
  isSearchLoading: boolean;
  onSearchQueryChange: (query: string) => void;
}

export default function Header({
  isOverlayOpen,
  isSearchLoading,
  onSearchQueryChange,
}: HeaderProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const languages = useOverlayLanguages();

  const [visualQuery, setVisualQuery] = useState("");

  const { autoPlay, setAutoPlay } = useAppStore();

  useEffect(() => {
    startTransition(() => {
      setVisualQuery("");
      onSearchQueryChange("");
    });
  }, [isOverlayOpen, onSearchQueryChange]);

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualQuery(e.target.value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSearchQueryChange(e.target.value);
    }, 300);
  };

  return (
    <div className="flex items-center gap-4 shrink-0">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search word uses across your library..."
        value={visualQuery}
        onChange={handleChangeQuery}
        className={`flex-1 bg-transparent border-b border-primary-border focus:border-active-border outline-none py-2 px-1 text-primary-foreground transition-colors ${
          isSearchLoading ? "opacity-50" : "opacity-100"
        }`}
      />
      <div className="flex items-center gap-2 shrink-0">
        <LanguageFilter
          source={languages.source}
          translation={languages.translation}
          isLoading={languages.isLoading || languages.isFetching}
          isError={languages.isError}
        />
        <span className="text-xs text-secondary-foreground">Auto-play</span>
        <button
          data-testid="autoplay-toggle"
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
    </div>
  );
}
