"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { StudyCard } from "@/types/study";

interface SessionResponse {
  sessionId: string;
  deckTitle: string;
  totalDue: number;
  reviewedCount: number;
  nextReviewAt: string | null;
}

interface CardsPage {
  cards: StudyCard[];
  cursor: number | null;
  nextCursor: number | null;
}

async function createOrResumeSession(
  deckId: string,
  sourceLanguage: string | null,
): Promise<SessionResponse> {
  const res = await fetch("/api/study/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deckId,
      sourceLanguage: sourceLanguage ?? undefined,
    }),
  });
  if (!res.ok) throw new Error("Failed to start study session");
  return res.json();
}

async function fetchCardsPage(
  sessionId: string,
  cursor: number | null,
): Promise<CardsPage> {
  const params = new URLSearchParams();
  if (cursor !== null) params.set("cursor", String(cursor));

  const res = await fetch(
    `/api/study/session/${sessionId}?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch study cards");
  return res.json();
}

// Once fewer than this many unreviewed cards remain in the local buffer,
// proactively fetch the next page so the queue never stalls mid-session.
const PREFETCH_THRESHOLD = 5;

export default function useStudyQueue(
  deckId: string,
  sourceLanguage: string | null,
) {
  // Cards the user has rated this render but that the server may not have
  // "caught up" on yet in our cached pages. Purely a local filter — the
  // GET route already excludes reviewed cards on every real fetch, this
  // just makes card removal feel instant without waiting on a refetch.
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const sessionQuery = useQuery({
    queryKey: ["study-session", deckId],
    queryFn: () => createOrResumeSession(deckId, sourceLanguage),
    enabled: !!deckId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const sessionId = sessionQuery.data?.sessionId;
  const totalDue = sessionQuery.data?.totalDue ?? 0;

  const cardsQuery = useInfiniteQuery({
    queryKey: ["study-cards", sessionId],
    queryFn: ({ pageParam }) => fetchCardsPage(sessionId as string, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!sessionId && totalDue > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const cards = useMemo(() => {
    const all = cardsQuery.data?.pages.flatMap((page) => page.cards) ?? [];
    return all.filter((c) => !dismissedIds.has(c.id));
  }, [cardsQuery.data, dismissedIds]);

  useEffect(() => {
    if (
      cards.length > 0 &&
      cards.length <= PREFETCH_THRESHOLD &&
      cardsQuery.hasNextPage &&
      !cardsQuery.isFetchingNextPage
    ) {
      cardsQuery.fetchNextPage();
    }
  }, [cards.length, cardsQuery]);

  const dismissCard = (cardId: string) =>
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });

  // Used to roll back an optimistic dismiss if the review call actually fails.
  const restoreCard = (cardId: string) =>
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });

  const isLoading =
    sessionQuery.isLoading ||
    (!!sessionId && totalDue > 0 && cardsQuery.isLoading);

  return {
    isLoading,
    error: sessionQuery.error ?? cardsQuery.error ?? null,
    sessionId,
    studyDetails: {
      deckTitle: sessionQuery.data?.deckTitle ?? "",
      totalDue,
      nextReviewAt: sessionQuery.data?.nextReviewAt ?? null,
    },
    initialReviewedCount: sessionQuery.data?.reviewedCount ?? 0,
    currentCard: cards[0] ?? null,
    dismissCard,
    restoreCard,
  };
}
