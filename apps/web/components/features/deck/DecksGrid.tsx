"use client";

import { Deck } from "@/hooks/useDecks";
import DeckCard from "./DeckCard";
import DeckCardCreateNew from "./DeckCardCreateNew";

interface Props {
  decks: Deck[];
  onCreateNew: () => void;
}

export default function DecksGrid({ decks, onCreateNew }: Props) {
  return (
    <>
      {decks.length <= 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-64">
          <DeckCardCreateNew onClick={onCreateNew} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeckCardCreateNew onClick={onCreateNew} />
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </>
  );
}
