import { USE_LIBRARY_HOOK_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "./useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";

export function useLibrary({
  enabled,
  selectedSourceLanguage,
  // selectedSubtitleLanguage,
}: {
  enabled: boolean;
  selectedSourceLanguage: string;
  selectedSubtitleLanguage: string;
}) {
  const { params } = useZodSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA);

  return useQuery<LibraryResponse>({
    enabled,
    queryKey: ["library", { ...params, selectedSourceLanguage }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.unreg) searchParams.set("unreg", "true");
      searchParams.set("page", String(params.page));
      searchParams.set("selectedSrc", selectedSourceLanguage);
      // searchParams.set("selectedSub", selectedSubtitleLanguage);

      const response = await fetch(`/api/library?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch library");

      return response.json();
    },
  });
}

export const DEFAULT_LIBRARY_RESPONSE: LibraryResponse = {
  items: [],
  total: 0,
  pageCount: 0,
};
