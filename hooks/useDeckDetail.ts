"use client";

import { useQuery } from "@tanstack/react-query";

export interface DeckDetail {
  deck: { id: string; name: string; is_default: boolean };
  availableLanguages: string[];
}

async function fetchDeckDetail(deckId: string): Promise<DeckDetail> {
  const res = await fetch(`/api/decks/${deckId}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export function useDeckDetail(deckId: string) {
  return useQuery({
    queryKey: ["deck-detail", deckId],
    queryFn: async () => fetchDeckDetail(deckId),
    staleTime: 30_000,
    enabled: !!deckId,
  });
}
