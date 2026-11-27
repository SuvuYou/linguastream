"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Props {
  studyDetails: { deckTitle: string; nextReviewAt: string | null };
}

export default function SessionEmptyState({ studyDetails }: Props) {
  const router = useRouter();

  return (
    <section className="flex justify-center items-center h-full w-full mx-auto max-w-[1400px] p-6 max-[560px]:p-4">
      <Card className="flex justify-center items-center relative max-w-5xl w-full mx-auto px-6 py-8 gap-6">
        <h2 className="text-4xl font-medium text-primary-foreground">
          No cards for review
        </h2>
        <p className="text-base text-primary-foreground">
          No cards due in {studyDetails.deckTitle}.
        </p>
        {studyDetails.nextReviewAt && (
          <p className="text-sm text-primary-foreground">
            Next review: {new Date(studyDetails.nextReviewAt).toLocaleString()}
          </p>
        )}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/decks")}
        >
          Back to Decks
        </Button>
      </Card>
    </section>
  );
}
