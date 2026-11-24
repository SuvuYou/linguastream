"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SMRating } from "@/lib/algorithms/sm2";
import type useStudyQueue from "@/hooks/useStudyQueue";

interface RatingCount {
  0: number;
  1: number;
  2: number;
  3: number;
}

interface ReviewResponse {
  reviewedCount: number;
  totalDue: number;
  progress: number;
  completed: boolean;
}

const INITIAL_RATING_COUNT = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
};

class AlreadyReviewedError extends Error {
  constructor() {
    super("ALREADY_REVIEWED");
  }
}

async function submitReview(
  sessionId: string,
  cardId: string,
  rating: SMRating,
): Promise<ReviewResponse> {
  const res = await fetch(`/api/study/session/${sessionId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, rating }),
  });

  if (res.status === 409) {
    // Duplicate submit (double-click, retry). Not a real failure —
    // the card is already reviewed server-side, so just treat as a no-op.
    throw new AlreadyReviewedError();
  }

  if (!res.ok) {
    throw new Error("Failed to submit review");
  }

  return res.json();
}

type StudyQueue = ReturnType<typeof useStudyQueue>;

export default function useStudySessionRating(queue: StudyQueue) {
  const queryClient = useQueryClient();
  const [shouldShowBack, setShouldShowBack] = useState(false);
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [ratingCounts, setRatingCounts] =
    useState<RatingCount>(INITIAL_RATING_COUNT);

  const reviewMutation = useMutation({
    mutationFn: ({ cardId, rating }: { cardId: string; rating: SMRating }) => {
      if (!queue.sessionId) throw new Error("No active session");
      return submitReview(queue.sessionId, cardId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const handleRating = (rating: SMRating) => {
    const card = queue.currentCard;
    if (!card || reviewMutation.isPending) return;

    // Optimistic advance: hide the card and bump the counter immediately
    // so the UI never waits on the network between cards.
    queue.dismissCard(card.id);
    setShouldShowBack(false);
    setReviewedCount((count) => (count ?? 0) + 1);
    setRatingCounts((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    reviewMutation.mutate(
      { cardId: card.id, rating },
      {
        onError: (err) => {
          if (err instanceof AlreadyReviewedError) return;

          // A genuine failure (network/server error): the rating never
          // landed, so put the card back and undo the optimistic count.
          // Note this doesn't restore the user's place in the deck if
          // other cards were already reviewed after it — good enough for
          // a rare failure case, but surface an error toast here so the
          // user knows to retry rather than assuming it saved.
          queue.restoreCard(card.id);
          setReviewedCount((count) => Math.max(0, (count ?? 1) - 1));
          setRatingCounts((prev) => ({ ...prev, [rating]: prev[rating] - 1 }));
        },
      },
    );
  };

  return {
    shouldShowBack,
    setShouldShowBack,
    handleRating,
    stats: {
      ratingCounts,
      reviewedCount: reviewedCount ?? 0,
      isSubmitting: reviewMutation.isPending,
      submitError:
        reviewMutation.isError &&
        !(reviewMutation.error instanceof AlreadyReviewedError)
          ? reviewMutation.error
          : null,
    },
  };
}
