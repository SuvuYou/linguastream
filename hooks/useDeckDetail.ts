"use client";

import { useQuery } from "@tanstack/react-query";

export interface CardWordProfile {
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
  deck: { id: string; name: string; is_default: boolean };
  cards: DeckDetailCard[];
  total: number;
  pageCount: number;
  availableLanguages: string[];
}

interface UseDeckDetailParams {
  deckId: string;
  page: number;
  lang?: string;
  q?: string;
}

async function fetchDeckDetail(
  params: UseDeckDetailParams,
): Promise<DeckDetail> {
  const sp = new URLSearchParams({ page: String(params.page), limit: "50" });
  if (params.lang) sp.set("lang", params.lang);
  if (params.q) sp.set("q", params.q);
  const res = await fetch(`/api/decks/${params.deckId}?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export function useDeckDetail(params: UseDeckDetailParams) {
  return useQuery({
    queryKey: ["deck-detail", params],
    queryFn: async () => fetchDeckDetail(params),
    staleTime: 30_000,
    enabled: !!params.deckId,
  });
}
