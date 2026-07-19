"use client";

import { useState } from "react";
import { useDecks } from "@/hooks/useDecks";
import { Skeleton } from "@/components/ui/skeleton";
import CreateDeckModal, {
  DeckCreationState,
} from "@/components/features/deck/CreateDeckModal";
import DecksGrid from "@/components/features/deck/DecksGrid";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";

export default function DecksPage() {
  const { data, isLoading, isError } = useDecks();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const languages = useLibraryLanguages();

  const [deckCreationState, setDeckCreationState] = useState<DeckCreationState>(
    { deckName: "", isCreating: false, errorMessage: null },
  );

  const decks = data?.decks ?? [];

  return (
    <section className="flex h-full w-full flex-col bg-background m-2 p-2 rounded-l-lg">
      <div className="px-4 py-4 flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-primary-foreground">
            Decks
          </h1>
          <LanguageFilter
            source={languages.source}
            translation={languages.translation}
            isLoading={languages.isLoading || languages.isFetching}
            isError={languages.isError}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="max-w-5xl mx-auto px-6 py-8 text-base text-primary-foreground">
            Failed to load decks.
          </div>
        ) : (
          <DecksGrid decks={decks} onCreateNew={() => setIsModalOpen(true)} />
        )}

        <CreateDeckModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          state={deckCreationState}
          setState={setDeckCreationState}
        />
      </div>
    </section>
  );
}
