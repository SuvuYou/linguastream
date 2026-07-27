"use client";

import { useQuery } from "@tanstack/react-query";

interface CardWordProfile {
  id: string;
  part_of_speech: string;
  forms: Record<string, string>;
  lexical_family: string[];
  collocations: string[];
}

export interface DeckDetailCard {
  id: string;
  word: string;
  source_language: string;
  translation_language: string;
  word_translation: string;
  context_text: string;
  context_translation: string | null;
  contextual_definition: string | null;
  media_content_id: string;
  start_ms: number;
  end_ms: number;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  streamUrl: string | null;
  word_profile: CardWordProfile | null;
}

export interface DeckDetail {
  cards: DeckDetailCard[];
  total: number;
  pageCount: number;
}

interface UseDeckDetailParams {
  deckId: string;
  page: number;
  lang?: string;
  q?: string;
}

async function fetchDeckCards(
  params: UseDeckDetailParams,
): Promise<DeckDetail> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: "50",
  });
  if (params.lang) searchParams.set("lang", params.lang);
  if (params.q) searchParams.set("q", params.q);
  const res = await fetch(`/api/decks/${params.deckId}/cards?${searchParams}`);

  if (!res.ok) throw new Error("Failed to fetch deck cards");

  return res.json();
}

export function useDeckCards(params: UseDeckDetailParams) {
  return useQuery({
    queryKey: ["deck-", params],
    queryFn: async () => fetchDeckCards(params),
    staleTime: 30_000,
    enabled: !!params.deckId,
  });
}
