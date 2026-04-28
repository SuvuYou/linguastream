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

  const { preferredSourceLanguage, preferredTranslationLanguage } =
    useAppStore();

  const { availableSourceLanguages, availableTranslationLanguages } =
    data || DEFAULT_LANGUAGES_RESPONSE;

  const searchParams = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);
  const { src: sourceLanguage, sub: translationLanguage } = searchParams.params;

  useEffect(() => {
    if (!sourceLanguage && preferredSourceLanguage) {
      searchParams.set({ src: preferredSourceLanguage as LanguageCode });
    }
  }, [sourceLanguage, preferredSourceLanguage, searchParams]);

  useEffect(() => {
    if (!translationLanguage && preferredTranslationLanguage) {
      searchParams.set({ sub: preferredTranslationLanguage as LanguageCode });
    }
  }, [translationLanguage, preferredTranslationLanguage, searchParams]);

  if (
    availableSourceLanguages.length == 0
    // availableTranslationLanguages.length == 0
  ) {
    return {
      selectedSourceLanguage: null,
      selectedTranslationLanguage: null,
      availableSourceLanguages,
      availableTranslationLanguages,
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

  const selectedTranslationLanguage = translationLanguage;
  // availableTranslationLanguages.includes(translationLanguage)
  //   ? translationLanguage
  //   : availableTranslationLanguages[0];

  return {
    selectedSourceLanguage,
    selectedTranslationLanguage,
    availableSourceLanguages,
    availableTranslationLanguages,
    isLoading,
    isFetching,
    isError,
  };
}

export const DEFAULT_LANGUAGES_RESPONSE: LanguagesResponse = {
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};
