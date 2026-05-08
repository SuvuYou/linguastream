import type { SearchResponse } from "@/types/search";
import { useQuery } from "@tanstack/react-query";

export function useSearch({
  enabled,
  query,
  sourceLanguage,
  translationLanguage,
}: {
  enabled?: boolean;
  query: string;
  sourceLanguage: string;
  translationLanguage: string;
}) {
  return useQuery<SearchResponse>({
    enabled,
    queryKey: [
      "search",
      { q: query, src: sourceLanguage, trans: translationLanguage },
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      searchParams.set("q", query);
      searchParams.set("src", sourceLanguage);
      searchParams.set("trans", translationLanguage);

      const response = await fetch(`/api/search?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch search results");

      return response.json();
    },
  });
}
