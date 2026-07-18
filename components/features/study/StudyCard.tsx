"use client";

import { useStreamUrl } from "@/hooks/useStreamUrl";
import type { StudyCard } from "@/types/study";
import PlayerSmall from "../player/PlayerSmall";
import { calculateNextReview, SMRating } from "@/lib/algorithms/sm2";
import { Button } from "@/components/ui/button";

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
  const streamData = useStreamUrl(card?.media_content_id ?? null);

  return (
    <div className="border border-primary-border flex flex-col min-h-120">
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-8 flex-1 border-b border-primary-border">
        <span className="text-xs text-primary-foreground uppercase tracking-wider">
          {card.source_language} → {card.translation_language}
        </span>

        <h1 className="text-5xl font-medium text-primary-foreground text-center">
          {card.word}
        </h1>

        <p className="text-sm text-primary-foreground text-center max-w-sm leading-relaxed mt-2">
          {card.context_text}
        </p>
      </div>

      {shouldShowBack ? (
        <div className="flex flex-col gap-5 px-8 py-6">
          <div className="text-center">
            <p className="text-2xl text-primary-foreground">
              {card.word_translation}
            </p>
            {card.contextual_definition && (
              <p className="text-sm text-primary-foreground mt-1">
                {card.contextual_definition}
              </p>
            )}
          </div>

          {card.context_translation && (
            <p className="text-sm text-primary-foreground text-center italic">
              {card.context_translation}
            </p>
          )}

          {streamData.data && (
            <div className="h-40 w-full bg-black">
              <PlayerSmall
                streamUrl={streamData.data.streamUrl}
                mediaItem={adaptCardToPlayableMedia(card)}
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 2, 3] as SMRating[]).map((rating) => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className={`flex flex-col items-center py-3 border text-sm font-medium text-white transition-colors ${RATING_COLORS[rating]}`}
              >
                <span>{RATING_LABELS[rating]}</span>
                <span className="text-xs opacity-70 mt-0.5">
                  {nextIntervalLabel(card, rating)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Button onClick={() => setShouldShowBack(true)}>Show Answer</Button>
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

function adaptCardToPlayableMedia(card: StudyCard) {
  return {
    source_text: card.context_text,
    translation_text: card.context_translation,
    start_ms: card.start_ms,
    end_ms: card.end_ms,
    media_title: card.word,
  };
}
