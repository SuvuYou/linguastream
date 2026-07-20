"use client";

import { Button } from "@/components/ui/button";
import { SMRating } from "@/lib/algorithms/sm2";
import { useRouter } from "next/router";

interface Props {
  studyDetails: { deckTitle: string; nextReviewAt: string | null };
  stats: { reviewedCount: number; ratingCounts: Record<SMRating, number> };
}

export default function SessionCompleteState({ studyDetails, stats }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center gap-4 text-center">
      <div className="text-4xl">🎉</div>
      <h2 className="text-xl font-medium text-primary-foreground">
        All caught up!
      </h2>
      <p className="text-sm text-primary-foreground">
        No cards due in {studyDetails.deckTitle}.
      </p>
      {studyDetails.nextReviewAt && (
        <p className="text-xs text-primary-foreground">
          Next review: {new Date(studyDetails.nextReviewAt).toLocaleString()}
        </p>
      )}
      <p className="text-sm text-primary-foreground">
        {stats.reviewedCount} cards reviewed
      </p>
      <div className="flex gap-6 text-sm">
        <span className="text-red-400">Again: {stats.ratingCounts[0]}</span>
        <span className="text-orange-400">Hard: {stats.ratingCounts[1]}</span>
        <span className="text-yellow-400">Good: {stats.ratingCounts[2]}</span>
        <span className="text-green-400">Easy: {stats.ratingCounts[3]}</span>
      </div>
      <Button variant="outline" onClick={() => router.push("/dashboard/decks")}>
        Back to Decks
      </Button>
    </div>
  );
}
