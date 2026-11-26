"use client";

import { getWordDefinitionRoute } from "@linguastream/contracts";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { ActiveWord } from "@/lib/initializations/store";

export function useWordDefinition(word: ActiveWord | null) {
  return useQuery({
    queryKey: ["word-definition", word?.word, word?.lang],
    queryFn: () =>
      apiRequest(getWordDefinitionRoute, {
        query: { word: word!.word, lang: word!.lang, context: word!.context },
      }),
    enabled: !!word && !!word?.word && !!word?.lang && !!word?.context,
  });
}
