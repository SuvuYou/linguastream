"use client";

import { useState } from "react";
import { useDecks } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CreateDeckModal, {
  DeckCreationState,
} from "@/components/features/deck/CreateDeckModal";
import DecksGrid from "@/components/features/deck/DecksGrid";

export default function DecksPage() {
  const { data, isLoading, isError } = useDecks();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deckCreationState, setDeckCreationState] = useState<DeckCreationState>(
    { deckName: "", isCreating: false, errorMessage: null },
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-primary-foreground">
        Failed to load decks.
      </div>
    );
  }

  const decks = data?.decks ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-primary-foreground">Decks</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ New Deck</Button>
      </div>
      <DecksGrid decks={decks} />

      <CreateDeckModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        state={deckCreationState}
        setState={setDeckCreationState}
      />
    </div>
  );
}
