import type { SearchResponse } from "@/types/search";
import { useQuery } from "@tanstack/react-query";

export function useSearch({
  query,
  sourceLanguage,
}: {
  query: string;
  sourceLanguage: string;
}) {
  return useQuery<SearchResponse>({
    queryKey: ["search", { q: query, lang: sourceLanguage }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      searchParams.set("q", query);
      searchParams.set("lang", sourceLanguage);

      const response = await fetch(`/api/search?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch search results");

      return response.json();
    },
  });
}
