import type { SearchResponse } from "@/types/search";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useSearch({
  enabled,
  query,
  sourceLanguage,
  translationLanguage,
  page = 0,
  limit = 30,
}: {
  enabled?: boolean;
  query: string;
  sourceLanguage: string;
  translationLanguage: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<SearchResponse>({
    enabled,
    queryKey: [
      "search",
      {
        q: query,
        src: sourceLanguage,
        trans: translationLanguage,
        page,
        limit,
      },
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      searchParams.set("q", query);
      searchParams.set("src", sourceLanguage);
      searchParams.set("trans", translationLanguage);
      searchParams.set("page", String(page + 1));
      searchParams.set("limit", String(limit));

      const response = await fetch(`/api/search?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch search results");

      return response.json();
    },
  });
}
