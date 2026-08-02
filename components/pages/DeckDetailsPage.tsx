"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeckDetail } from "@/hooks/useDeckDetail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CardsPagination from "@/components/features/deck-details/CardsPagination";
import CardsList from "@/components/features/deck-details/CardsList";
import { BookOpen } from "lucide-react";
import SourceLanguageFilter from "@/components/features/deck-details/SourceLanguageFilter";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { DECK_DETAILS_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useDeckCards } from "@/hooks/useDeckCards";
import { DeleteCardsAlert } from "@/components/features/deck-details/DeleteCardsAlert";
import SearchBar from "@/components/primitives/SearchBar";

interface DeckDetailPageProps {
  deckId: string;
}

export default function DeckDetailPage({ deckId }: DeckDetailPageProps) {
  const router = useRouter();

  const deckDetailsParams = useZodSearchParams(DECK_DETAILS_PARAMS_SCHEMA);

  const [activeLang, setActiveLang] = useState<string>("All");

  const deckDetails = useDeckDetail(deckId);

  const deckCards = useDeckCards({
    deckId,
    page: deckDetailsParams.params.page,
    lang: activeLang === "All" ? undefined : activeLang,
    q: deckDetailsParams.params.q ?? undefined,
  });

  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const toggleSelected = (id: string) =>
    setSelectedCards((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

  if (deckDetails.isLoading) {
    return (
      <section className="flex h-full w-full flex-col bg-background m-2 p-8 rounded-l-lg">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-74 w-full mb-4" />
      </section>
    );
  }

  const availableLanguages = deckDetails.data?.availableLanguages ?? [];

  return (
    <section className="flex h-full w-full flex-col bg-background m-2 p-2 rounded-l-lg">
      <div className="px-6 py-4 flex flex-col gap-6">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/dashboard/decks")}
              variant={"ghost"}
              size={"default"}
              className="text-xl! leading-6 h-auto p-0 text-primary-foreground hover:underline hover:bg-transparent! transition-colors"
            >
              Decks
            </Button>
            <span className="text-primary-foreground text-sm h-5 px-1">›</span>
            <span className="text-base text-primary-foreground h-5.5">
              {deckDetails.data?.deck.name ?? ""}
            </span>
          </div>
          <Button
            variant={"secondary"}
            size={"lg"}
            onClick={() => router.push(`/dashboard/study?deckId=${deckId}`)}
            className="px-6 flex gap-3"
          >
            <BookOpen />
            Study Deck
          </Button>
        </div>

        <div className="flex items-center gap-5">
          <h1 className="text-3xl font-medium text-primary-foreground">
            {deckDetails.data?.deck.name ?? ""}
          </h1>
          {deckDetails.data?.deck.is_default && (
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          )}
        </div>

        <div className="flex justify-between gap-8">
          <SearchBar placeholder="Search words in this deck..." />

          <DeleteCardsAlert
            deckId={deckId}
            selected={selectedCards}
            isOpen={confirmationDialogOpen}
            setIsOpen={setConfirmationDialogOpen}
            reset={() => {
              setSelectedCards(new Set());
              setConfirmationDialogOpen(false);
            }}
          />

          <SourceLanguageFilter
            source={{
              value: activeLang ?? "All",
              available: ["All", ...availableLanguages],
              onChange: (value) => {
                setActiveLang(value);
                deckDetailsParams.set({ page: 0 });
                setSelectedCards(new Set());
              },
            }}
            isLoading={deckDetails.isLoading}
            isError={deckDetails.isError}
          />
        </div>

        {deckCards.isLoading ? (
          <>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />

            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </>
        ) : deckCards.isError ? (
          <>
            (
            <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-primary-foreground">
              Failed to load deck.
            </div>
            );
          </>
        ) : (
          <>
            <CardsList
              cards={deckCards.data?.cards ?? []}
              searchQuery={deckDetailsParams.params.q ?? ""}
              cardSelection={{
                selected: selectedCards,
                toggle: toggleSelected,
              }}
            />
            <CardsPagination
              currentPage={deckDetailsParams.params.page}
              setPage={(newPage) => deckDetailsParams.set({ page: newPage })}
              pageCount={deckCards.data?.pageCount ?? 0}
            />
          </>
        )}
      </div>
    </section>
  );
}
