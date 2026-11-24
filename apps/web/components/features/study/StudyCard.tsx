"use client";

import type { StudyCard } from "@/types/study";
import { calculateNextReview, SMRating } from "@/lib/algorithms/sm2";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

interface Props {
  card: StudyCard;
  shouldShowBack: boolean;
  handleRating: (rating: SMRating) => void;
  setShouldShowBack: (shouldShowBack: boolean) => void;
}

export default function StudyCard({
  card,
  shouldShowBack,
  handleRating,
  setShouldShowBack,
}: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col items-center justify-between gap-3 pb-2 pt-2 px-8 flex-1 border-b border-border">
        <span className="text-sm text-primary-foreground uppercase tracking-wider">
          {card.source_language} → {card.translation_language}
        </span>

        <div className="flex-1 flex flex-col justify-center gap-6">
          <h1 className="text-6xl font-medium text-primary-foreground text-center">
            {card.word}
          </h1>

          <p className="text-base text-muted-foreground text-center max-w-sm leading-relaxed mt-2">
            {card.context_text}
          </p>

          {shouldShowBack && (
            <Button asChild size="xs" variant="outline">
              <Link
                href={`/watch/${card.media_content_id}?t=${card.start_ms}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="py-4"
              >
                <SquareArrowOutUpRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {shouldShowBack ? (
        <div className="flex flex-col gap-5 px-4 py-3">
          <div className="text-center">
            <p className="text-4xl text-primary-foreground pb-2 mb-2">
              {card.word_translation}
            </p>
            {card.contextual_definition && (
              <p className="text-sm text-muted-foreground">
                {card.contextual_definition}
              </p>
            )}
          </div>

          {card.context_translation && (
            <p className="text-sm text-primary/40 text-center italic">
              {card.context_translation}
            </p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 2, 3] as SMRating[]).map((rating) => (
              <Button
                key={rating}
                onClick={() => handleRating(rating)}
                className={`h-auto rounded-[12px] flex flex-col items-center py-3 border text-sm font-medium text-white transition-colors ${RATING_COLORS[rating]}`}
              >
                <span>{RATING_LABELS[rating]}</span>
                <span className="text-sm opacity-70 mt-0.5">
                  {nextIntervalLabel(card, rating)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center pt-8 pb-3">
          <Button
            variant={"outline"}
            size={"lg"}
            className="px-8 py-6"
            onClick={() => setShouldShowBack(true)}
          >
            Show Answer
          </Button>
        </div>
      )}
    </div>
  );
}

const RATING_LABELS = ["Again", "Hard", "Good", "Easy"] as const;
const RATING_COLORS = [
  "bg-red-900 hover:bg-red-800 border-red-700",
  "bg-orange-900 hover:bg-orange-800 border-orange-700",
  "bg-yellow-900 hover:bg-yellow-800 border-yellow-700",
  "bg-green-900 hover:bg-green-800 border-green-700",
] as const;

function intervalLabel(days: number): string {
  if (days < 1) return "< 1d";
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

function nextIntervalLabel(card: StudyCard, rating: SMRating): string {
  const result = calculateNextReview(
    {
      repetitions: card.repetitions,
      interval_days: card.interval_days,
      ease_factor: card.ease_factor,
    },
    rating,
  );
  return intervalLabel(result.interval_days);
}
