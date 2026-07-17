import { useState } from "react";
import { SMRating } from "@/lib/algorithms/sm2";
import { StudyCard } from "@/types/study";

interface RatingCount {
  0: number;
  1: number;
  2: number;
  3: number;
}

interface Props {
  cards: StudyCard[];
  currentCard: StudyCard;
  currentIndex: number;
  advance: () => void;
}

function sendReview(cardId: string, rating: SMRating) {
  fetch(`/api/cards/${cardId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
}

export default function useStudySessionRating({ currentCard, advance }: Props) {
  const [shouldShowBack, setShouldShowBack] = useState(false);

  const [stats, setStats] = useState<{
    reviewedCount: number;
    ratingCounts: RatingCount;
  }>({
    reviewedCount: 0,
    ratingCounts: { 0: 0, 1: 0, 2: 0, 3: 0 },
  });

  async function handleRating(rating: SMRating) {
    if (!currentCard) return;

    setShouldShowBack(false);
    setStats((prev) => ({
      reviewedCount: prev.reviewedCount + 1,
      ratingCounts: {
        ...prev.ratingCounts,
        [rating]: prev.ratingCounts[rating] + 1,
      },
    }));

    advance();
    sendReview(currentCard.id, rating);
  }

  return { shouldShowBack, setShouldShowBack, stats, handleRating };
}
