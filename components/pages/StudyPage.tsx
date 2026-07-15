"use client";

import StudyCard from "@/components/features/study/StudyCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/router";
import useStudyQueue from "@/hooks/useStudyQueue";
import useStudySessionRating from "@/hooks/useStudySessionRating";
import { STUDY_PAGE_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SessionCompleteState from "@/components/features/study/SessionCompleteState";

export default function StudyPage() {
  const { params } = useZodSearchParams(STUDY_PAGE_PARAMS_SCHEMA);

  const router = useRouter();

  const queue = useStudyQueue(params.deckId);
  const sessionRating = useStudySessionRating(queue);

  if (queue.isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (queue.studyDetails.isAllDone) {
    return SessionCompleteState;
  }

  const progress =
    queue.studyDetails.totalDue > 0
      ? Math.round(
          (sessionRating.stats.reviewedCount / queue.studyDetails.totalDue) *
            100,
        )
      : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-1.5" />
        <span className="text-xs text-secondary-text tabular-nums shrink-0">
          {sessionRating.stats.reviewedCount} / {queue.studyDetails.totalDue}
        </span>
        <StudyCard
          card={queue.currentCard}
          handleRating={sessionRating.handleRating}
          shouldShowBack={sessionRating.shouldShowBack}
          setShouldShowBack={sessionRating.setShouldShowBack}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-secondary-text"
          onClick={() => router.push("/decks")}
        >
          End Session
        </Button>
      </div>
    </div>
  );
}
