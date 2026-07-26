"use client";

import { useQuery } from "@tanstack/react-query";

export interface DeckStats {
  total: number;
  due: number;
  learned: number;
  progress: number;
}

export interface Deck {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  stats: DeckStats;
}

async function fetchDecks(
  sourceLanguage: string | null,
): Promise<{ decks: Deck[] }> {
  const params = new URLSearchParams();
  if (sourceLanguage) params.set("sourceLanguage", sourceLanguage);

  const res = await fetch(`/api/decks?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch decks");
  return res.json();
}

export function useDecks(sourceLanguage: string | null) {
  return useQuery({
    queryKey: ["decks", sourceLanguage],
    queryFn: () => fetchDecks(sourceLanguage),
    staleTime: 30_000,
  });
}
