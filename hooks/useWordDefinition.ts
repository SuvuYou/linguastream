"use client";

import { ActiveWord } from "@/lib/initializations/store";
import { useQuery } from "@tanstack/react-query";

async function fetchDefinition(word?: string, lang?: string, context?: string) {
  if (!word || !lang || !context) return;

  const res = await fetch(
    `/api/definition?word=${encodeURIComponent(word)}&lang=${lang}&context=${encodeURIComponent(context)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch definition");

  return res.json();
}

export function useWordDefinition(word: ActiveWord | null) {
  const query = useQuery<{ translation: string; definition: string }>({
    queryKey: ["word-definition", word?.word, word?.lang],
    queryFn: async () => fetchDefinition(word?.word, word?.lang, word?.context),
    enabled: !!word && !!word?.word && !!word?.lang && !!word?.context,
  });

  return query;
}
