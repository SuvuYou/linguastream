"use client";

import { ActiveWord } from "@/lib/initializations/store";
import type { WordProfile } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function fetchWordProfile(
  word?: string,
  lang?: string,
  context?: string,
) {
  if (!word || !lang || !context) return;

  const res = await fetch(
    `/api/word-profile?word=${encodeURIComponent(word)}&lang=${lang}&context=${encodeURIComponent(context)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch word profile");

  return res.json();
}

export function useWordProfile(word: ActiveWord | null) {
  const query = useQuery<WordProfile>({
    queryKey: ["word-profile", word?.word, word?.lang],
    queryFn: async () =>
      fetchWordProfile(word?.word, word?.lang, word?.context),
    enabled: !!word && !!word?.word && !!word?.lang,
  });

  return query;
}
