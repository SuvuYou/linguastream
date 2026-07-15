import { useState, useEffect, useCallback, useRef } from "react";
import type { StudyCard } from "@/types/study";

const BATCH_SIZE = 20;
const BUFFER_BATCHES = 3;
const PREFETCH_THRESHOLD = BATCH_SIZE * 2;

export default function useStudyQueue(deckId: string) {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [studyDetails, setStudyDetails] = useState<{
    isAllDone: boolean;
    deckTitle: string;
    totalDue: number;
    nextReviewAt: string | null;
  }>({
    isAllDone: false,
    deckTitle: "",
    totalDue: 0,
    nextReviewAt: null,
  });

  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);

  const baseFetch = useCallback(async (deckId: string) => {
    const params = new URLSearchParams({
      deckId,
      limit: String(BATCH_SIZE),
    });

    if (cursorRef.current) params.set("cursor", cursorRef.current);

    const res = await fetch(`/api/study?${params}`);
    if (!res.ok) throw new Error("Failed to fetch cards");
    const data = await res.json();

    const newCards: StudyCard[] = data.cards;

    if (newCards.length < BATCH_SIZE) {
      hasMoreRef.current = false;
    } else {
      cursorRef.current = newCards[newCards.length - 1]?.id;
    }

    return [data, newCards];
  }, []);

  useEffect(() => {
    if (!deckId) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);

      cursorRef.current = undefined;
      hasMoreRef.current = true;

      try {
        const [data, newCards] = await baseFetch(deckId);

        if (cancelled) return;

        setStudyDetails({
          isAllDone: newCards.length === 0,
          deckTitle: data.deckName,
          totalDue: data.totalDue,
          nextReviewAt: data.nextReviewAt ?? null,
        });

        setCards(newCards);
        setCurrentIndex(0);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [deckId, baseFetch]);

  const fetchNextBatch = useCallback(async () => {
    if (!deckId || !hasMoreRef.current) return;

    try {
      const [, newCards] = await baseFetch(deckId);

      setCards((prev) => [...prev, ...newCards]);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, baseFetch]);

  useEffect(() => {
    const remaining = cards.length - currentIndex - 1;

    if (remaining <= PREFETCH_THRESHOLD) fetchNextBatch();
  }, [fetchNextBatch, cards, currentIndex]);

  const advance = useCallback(() => {
    const maxBuffer = BATCH_SIZE * BUFFER_BATCHES;
    const nextIndex = currentIndex + 1;

    if (nextIndex > BATCH_SIZE && cards.length > maxBuffer) {
      setCards((prev) => prev.slice(BATCH_SIZE));
      setCurrentIndex(nextIndex - BATCH_SIZE);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, cards.length]);

  return { isLoading, studyDetails, cards, currentIndex, advance };
}
