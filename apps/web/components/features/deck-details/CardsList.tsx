"use client";

import CardAccordionItem from "@/components/features/deck-details/CardAccordionItem";
import { Accordion } from "@/components/ui/accordion";
import { DeckDetailCard } from "@/hooks/useDeckCards";

interface Props {
  cards: DeckDetailCard[];
  searchQuery: string;
  cardSelection: {
    selected: Set<string>;
    toggle: (id: string) => void;
  };
}

export default function CardsList({
  cards,
  searchQuery,
  cardSelection,
}: Props) {
  return (
    <>
      {cards.length === 0 ? (
        <div className="py-16 text-center text-sm text-primary-foreground">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : "No cards in this deck yet."}
        </div>
      ) : (
        <>
          <Accordion type="single" collapsible className="border border-border">
            {cards.map((card) => (
              <CardAccordionItem
                key={card.id}
                card={card}
                cardSelection={cardSelection}
              />
            ))}
          </Accordion>
        </>
      )}
    </>
  );
}
