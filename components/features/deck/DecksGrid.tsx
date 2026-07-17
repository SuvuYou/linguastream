"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/initializations/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Deck } from "@/hooks/useDecks";

interface Props {
  decks: Deck[];
}

export default function DecksGrid({ decks }: Props) {
  const router = useRouter();
  const { preferredSourceLanguage } = useAppStore();

  const now = new Date();

  return (
    <>
      {decks.length === 0 ? (
        <div className="py-24 text-center text-sm text-secondary-text">
          No decks yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const filteredCards = preferredSourceLanguage
              ? deck.cards.filter(
                  (c) => c.source_language === preferredSourceLanguage,
                )
              : deck.cards;

            const total = filteredCards.length;
            const due = filteredCards.filter(
              (c) => new Date(c.next_review) <= now,
            ).length;
            const learned = total - due;
            const progress =
              total > 0 ? Math.round((learned / total) * 100) : 0;

            return (
              <div
                key={deck.id}
                className="border border-primary-border p-5 flex flex-col gap-4 hover:bg-background-hover transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-medium text-primary-text leading-tight">
                    {deck.name}
                  </h2>
                  {deck.is_default && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-secondary-text">
                  <span>{total} cards</span>
                  {due > 0 && (
                    <span className="text-active-border">{due} due</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Progress value={progress} className="h-1" />
                  <span className="text-xs text-secondary-text">
                    {progress}% learned
                  </span>
                </div>

                <Button
                  className="w-full mt-auto"
                  disabled={due === 0}
                  onClick={() => router.push(`/study?deckId=${deck.id}`)}
                >
                  {due === 0 ? "All caught up" : "Study Deck"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
