"use client";

import StudyCard from "@/components/features/study/StudyCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import useStudyQueue from "@/hooks/useStudyQueue";
import useStudySessionRating from "@/hooks/useStudySessionRating";
import { STUDY_PAGE_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SessionCompleteState from "@/components/features/study/SessionCompleteState";
import { Card } from "../ui/card";
import SessionEmptyState from "../features/study/SessionEmptyState";
import { useAppStore } from "@/lib/initializations/store";

export default function StudyPage() {
  const { preferredSourceLanguage } = useAppStore();

  const { params } = useZodSearchParams(STUDY_PAGE_PARAMS_SCHEMA);

  const router = useRouter();

  const queue = useStudyQueue(
    params.deckId,
    (params.src as string) ?? preferredSourceLanguage,
  );
  const sessionRating = useStudySessionRating(queue);

  const isAllDone =
    queue.studyDetails.totalDue > 0 &&
    sessionRating.stats.reviewedCount >= queue.studyDetails.totalDue;

  if (queue.isLoading) {
    return (
      <section className="grid grid-rows-16 h-full w-full bg-background m-2 p-2 rounded-l-lg">
        <Card className="relative max-w-5xl w-full row-span-3 row-start-2 row-end-15 mx-auto px-6 py-8 gap-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </section>
    );
  }

  if (queue.studyDetails.totalDue === 0) {
    return <SessionEmptyState studyDetails={queue.studyDetails} />;
  }

  if (isAllDone) {
    return (
      <SessionCompleteState
        studyDetails={queue.studyDetails}
        stats={sessionRating.stats}
      />
    );
  }

  const progress =
    queue.studyDetails.totalDue > 0
      ? Math.round(
          (sessionRating.stats.reviewedCount / queue.studyDetails.totalDue) *
            100,
        )
      : 0;

  return (
    <section className="grid grid-rows-16 h-full w-full bg-background m-2 p-2 rounded-l-lg">
      <Card className="relative max-w-5xl w-full row-span-3 row-start-2 row-end-15 mx-auto px-6 py-8 gap-6">
        <Button
          variant="destructive"
          size="xs"
          className="h-5 px-5 py-4 text-xs absolute right-0 top-0 mt-6 mr-6 z-30"
          onClick={() => router.push("/dashboard/decks")}
        >
          End Session
        </Button>

        <div className="w-full relative">
          <span className="text-sm text-muted-foreground tabular-nums shrink-0 w-full flex justify-center pb-4">
            Card {sessionRating.stats.reviewedCount} of{" "}
            {queue.studyDetails.totalDue}
          </span>
          <Progress value={progress} className="flex-1 h-1.5" />
        </div>
        {queue.currentCard && (
          <StudyCard
            card={queue.currentCard}
            handleRating={sessionRating.handleRating}
            shouldShowBack={sessionRating.shouldShowBack}
            setShouldShowBack={sessionRating.setShouldShowBack}
          />
        )}
      </Card>
    </section>
  );
}
