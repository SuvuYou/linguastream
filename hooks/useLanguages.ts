import { FETCH_LANGUAGES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LanguagesResponse } from "@/types/languages";
import { useAppStore } from "@/lib/initializations/store";
import { LanguageCode } from "@/helpers/const";
import { useEffect } from "react";

export function useLanguages() {
  const { data, isLoading, isFetching, isError } = useQuery<LanguagesResponse>({
    queryKey: ["langauges"],
    queryFn: async () => {
      const response = await fetch(`/api/languages`);

      if (!response.ok) throw new Error("Failed to fetch languages");

      return response.json();
    },
  });

  const { preferredSourceLanguage, preferredSubtitleLanguage } = useAppStore();

  const { availableSourceLanguages, availableSubtitleLanguages } =
    data || DEFAULT_LANGUAGES_RESPONSE;

  const searchParams = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);
  const { src: sourceLanguage, sub: subtitleLanguage } = searchParams.params;

  useEffect(() => {
    if (!sourceLanguage && preferredSourceLanguage) {
      searchParams.set({ src: preferredSourceLanguage as LanguageCode });
    }
  }, [sourceLanguage, preferredSourceLanguage, searchParams]);

  useEffect(() => {
    if (!subtitleLanguage && preferredSubtitleLanguage) {
      searchParams.set({ sub: preferredSubtitleLanguage as LanguageCode });
    }
  }, [subtitleLanguage, preferredSubtitleLanguage, searchParams]);

  if (
    availableSourceLanguages.length == 0
    // availableSubtitleLanguages.length == 0
  ) {
    return {
      selectedSourceLanguage: null,
      selectedSubtitleLanguage: null,
      availableSourceLanguages,
      availableSubtitleLanguages,
      isLoading,
      isFetching,
      isError,
    };
  }

  const selectedSourceLanguage = availableSourceLanguages.includes(
    sourceLanguage || "",
  )
    ? sourceLanguage
    : availableSourceLanguages[0];

  const selectedSubtitleLanguage = subtitleLanguage;
  // availableSubtitleLanguages.includes(subtitleLanguage)
  //   ? subtitleLanguage
  //   : availableSubtitleLanguages[0];

  return {
    selectedSourceLanguage,
    selectedSubtitleLanguage,
    availableSourceLanguages,
    availableSubtitleLanguages,
    isLoading,
    isFetching,
    isError,
  };
}

export const DEFAULT_LANGUAGES_RESPONSE: LanguagesResponse = {
  availableSourceLanguages: [],
  availableSubtitleLanguages: [],
};
