"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Deck } from "@/hooks/useDecks";
import { BookOpen, BookOpenCheck, TableOfContents } from "lucide-react";

interface Props {
  deck: Deck;
}

export default function DeckCard({ deck }: Props) {
  const router = useRouter();

  const total = deck.stats.total;
  const due = deck.stats.due;
  const progress = deck.stats.progress;

  return (
    <div className="group relative ">
      <div
        className="
      absolute inset-0
      translate-x-2 translate-y-2
      rounded-2xl
      border border-border
      bg-linear-to-br
      from-card
      to-background
      transition-all duration-300
      group-hover:translate-x-5
      group-hover:translate-y-3
    "
      />
      <div
        className="
      absolute inset-0
      translate-x-1.5 translate-y-1.5
      rounded-2xl
      border border-border
      bg-linear-to-br
      from-card
      to-background
      transition-all duration-300
      group-hover:translate-x-2
      group-hover:translate-y-3
    "
      />

      <div
        className="
      absolute inset-0
      translate-x-1 translate-y-1
      rounded-2xl
      border border-border
      bg-linear-to-br
      from-card
      to-background
      transition-all duration-300
      group-hover:translate-x-2
      group-hover:translate-y-0.5
    "
      />
      <div
        className="
      relative z-10
      rounded-2xl
      border border-border
      bg-card
      p-4
      flex flex-col gap-4
      transition-all duration-300
      group-hover:-translate-x-1
      group-hover:-translate-y-1
      group-hover:shadow-xl
    "
      >
        <div className="flex items-start justify-between gap-2 h-8">
          <h2 className="text-lg font-medium text-primary-foreground leading-tight">
            {deck.name}
          </h2>
          {deck.is_default && (
            <Badge variant="outline" size={"sm"} className="text-sm shrink-0">
              Default
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-primary-foreground">
          <span>{total} cards</span> {">"}
          {due > 0 && <span className="text-yellow-200">{due} due</span>}
        </div>

        <div className="flex flex-col gap-1">
          <Progress value={progress} className="h-1" />
          <span className="text-sm text-primary-foreground pt-2">
            {progress}% learned
          </span>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1"
            variant={"outline"}
            size={"lg"}
            disabled={due === 0}
            onClick={() => router.push(`/dashboard/study?deckId=${deck.id}`)}
          >
            {due === 0 ? (
              <BookOpenCheck className="size-6" />
            ) : (
              <BookOpen className="size-6" />
            )}
          </Button>
          <Button
            className="flex-1"
            size={"lg"}
            variant={"outline"}
            onClick={() => router.push(`/dashboard/decks/${deck.id}`)}
          >
            <TableOfContents className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
