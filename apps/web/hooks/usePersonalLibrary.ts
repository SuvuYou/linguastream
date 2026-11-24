import { PERSONAL_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";
import { PersonalItem } from "@/components/features/personal-library/Grid/PersonalCard";

interface LibraryResponse {
  items: PersonalItem[];
  total: number;
  pageCount: number;
}

export function usePersonalLibrary() {
  const languages = useLibraryLanguages();

  const params = useZodSearchParams(PERSONAL_LIBRARY_PARAMS_SCHEMA);

  return useQuery<LibraryResponse>({
    queryKey: [
      "personal-library",
      params.params.page,
      params.params.type,
      params.params.q,
      languages.source.value,
      languages.translation.value,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(params.params.page),
      });
      if (params.params.type && params.params.type !== "all") {
        queryParams.set("type", params.params.type);
      }
      if (params.params.q) queryParams.set("q", params.params.q);
      if (languages.source.value)
        queryParams.set("src", languages.source.value);
      if (languages.translation.value)
        queryParams.set("trans", languages.translation.value);

      const res = await fetch(`/api/library-personal?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled:
      !languages.isLoading &&
      !!languages.source.value &&
      !!languages.translation.value,
  });
}

export const DEFAULT_LIBRARY_RESPONSE: LibraryResponse = {
  items: [],
  total: 0,
  pageCount: 0,
};
