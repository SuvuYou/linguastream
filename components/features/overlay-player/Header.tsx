"use client";

import { useRef, useState, useEffect, startTransition } from "react";
import { useAppStore } from "@/lib/initializations/store";
import LanguageFilter, {
  LanguageFilterProps,
} from "@/components/features/library/LanguageFilter";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HeaderProps {
  source: Pick<LanguageFilterProps, "source">["source"];
  translation: Pick<LanguageFilterProps, "translation">["translation"];
  isLoading: boolean;
  isError: boolean;
  isOverlayOpen: boolean;
  isSearchLoading: boolean;
  onSearchQueryChange: (query: string) => void;
}

export default function Header({
  source,
  translation,
  isLoading,
  isError,
  isOverlayOpen,
  isSearchLoading,
  onSearchQueryChange,
}: HeaderProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex items-center gap-6 shrink-0 pb-2 border-b">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search word uses across your library..."
          value={visualQuery}
          onChange={handleChangeQuery}
          className="w-full pr-10"
        />
        {isSearchLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <LanguageFilter
          source={source}
          translation={translation}
          isLoading={isLoading}
          isError={isError}
        />
        <div className="flex items-center gap-2 mr-12">
          <Label
            htmlFor="autoplay-switch"
            className="text-xs cursor-pointer select-none"
          >
            Auto play
          </Label>
          <Switch
            id="autoplay-switch"
            data-testid="autoplay-toggle"
            checked={autoPlay}
            onCheckedChange={setAutoPlay}
          />
        </div>
      </div>
    </div>
  );
}
