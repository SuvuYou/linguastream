import { USE_LIBRARY_HOOK_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";
import { useUser } from "./useUser";
import { useLanguages } from "./useLanguages";

export const LIBRARY_QUERY_KEY = "library";

export function useLibrary({
  selectedSourceLanguage,
  selectedTranslationLanguage,
}: {
  selectedSourceLanguage: string;
  selectedTranslationLanguage: string;
}) {
  const { params } = useZodSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA);

  const user = useUser();
  const languages = useLanguages();

  const shouldAllowUnselectedLanguages = user.data?.is_admin && params.unreg;
  const areLanguagesSelected =
    !!languages.selectedSourceLanguage &&
    !!languages.selectedTranslationLanguage;

  const enabled =
    !languages.isLoading &&
    !languages.isFetching &&
    (areLanguagesSelected || shouldAllowUnselectedLanguages);

  return useQuery<LibraryResponse>({
    enabled,
    queryKey: [
      LIBRARY_QUERY_KEY,
      { ...params, selectedSourceLanguage, selectedTranslationLanguage },
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.q) searchParams.set("q", params.q);
      if (params.unreg) {
        searchParams.set("unreg", "true");
      } else {
        searchParams.delete("unreg");
      }
      searchParams.set("page", String(params.page));
      if (selectedSourceLanguage)
        searchParams.set("selectedSrc", selectedSourceLanguage);
      if (selectedTranslationLanguage)
        searchParams.set("selectedTrans", selectedTranslationLanguage);

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
