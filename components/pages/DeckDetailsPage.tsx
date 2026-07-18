"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDeckDetail } from "@/hooks/useDeckDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import CardsPagination from "../features/deck-details/CardsPagination";
import CardsList from "../features/deck-details/CardsList";
import { getLanguageLabel } from "@/helpers/language-helpers";

interface DeckDetailPageProps {
  deckId: string;
}

export default function DeckDetailPage({ deckId }: DeckDetailPageProps) {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [activeLang, setActiveLang] = useState<string | undefined>(undefined);
  const [visualQuery, setVisualQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isError } = useDeckDetail({
    deckId,
    page,
    lang: activeLang,
    q: searchQuery || undefined,
  });

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVisualQuery(e.target.value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(e.target.value);
        setPage(0);
      }, 300);
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-secondary-text">
        Failed to load deck.
      </div>
    );
  }

  const { deck, cards, total, pageCount, availableLanguages } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/decks")}
          className="text-xs text-secondary-text hover:text-primary-text transition-colors"
        >
          Decks
        </button>
        <span className="text-secondary-text text-xs">›</span>
        <span className="text-xs text-primary-text">{deck.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-primary-text">{deck.name}</h1>
          {deck.is_default && (
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          )}
        </div>
        <Button onClick={() => router.push(`/study?deckId=${deckId}`)}>
          Study Deck
        </Button>
      </div>

      <p className="text-sm text-secondary-text -mt-4">{total} cards</p>

      {availableLanguages.length > 1 && (
        <Tabs
          value={activeLang ?? "all"}
          onValueChange={(v) => {
            setActiveLang(v === "all" ? undefined : v);
            setPage(0);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {availableLanguages.map((lang) => (
              <TabsTrigger key={lang} value={lang}>
                {getLanguageLabel(lang)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <Input
        value={visualQuery}
        onChange={handleQueryChange}
        placeholder="Search words in this deck..."
        className="max-w-sm"
      />

      <CardsList cards={cards} searchQuery={searchQuery} />

      <CardsPagination
        currentPage={page}
        setPage={setPage}
        pageCount={pageCount}
      />
    </div>
  );
}
