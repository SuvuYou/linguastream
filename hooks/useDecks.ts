"use client";

import { useQuery } from "@tanstack/react-query";

export interface DeckCard {
  id: string;
  source_language: string;
  next_review: string;
}

export interface Deck {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  cards: DeckCard[];
}

async function fetchDecks(): Promise<{ decks: Deck[] }> {
  const res = await fetch("/api/decks");
  if (!res.ok) throw new Error("Failed to fetch decks");
  return res.json();
}

export function useDecks() {
  return useQuery({
    queryKey: ["decks"],
    queryFn: fetchDecks,
    staleTime: 30_000,
  });
}
