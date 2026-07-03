import { useQuery } from "@tanstack/react-query";
import type { LanguagesResponse } from "@/types/languages";

export const DEFAULT_LANGUAGES_RESPONSE: LanguagesResponse = {
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};

export function useAvailableLanguages() {
  return useQuery<LanguagesResponse>({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await fetch("/api/languages");

      if (!response.ok) {
        throw new Error("Failed to fetch languages");
      }

      return response.json();
    },
  });
}
