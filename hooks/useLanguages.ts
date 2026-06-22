import { FETCH_LANGUAGES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LanguagesResponse } from "@/types/languages";
import { useAppStore } from "@/lib/initializations/store";

export function useLanguages() {
  const { data, isLoading, isFetching, isError } = useQuery<LanguagesResponse>({
    queryKey: ["languages"],
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

  const { params } = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);
  const { src: sourceLanguageParam, trans: translationLanguageParam } = params;

  if (
    availableSourceLanguages.length == 0 ||
    availableTranslationLanguages.length == 0
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

  const fallbackSource =
    preferredSourceLanguage &&
    availableSourceLanguages.includes(preferredSourceLanguage)
      ? preferredSourceLanguage
      : availableSourceLanguages[0];

  const selectedSourceLanguage =
    sourceLanguageParam &&
    availableSourceLanguages.includes(sourceLanguageParam)
      ? sourceLanguageParam
      : fallbackSource;

  const filteredAvailableTranslationLanguages =
    availableTranslationLanguages.filter(
      (lang) => lang !== selectedSourceLanguage,
    );

  if (filteredAvailableTranslationLanguages.length == 0) {
    return {
      selectedSourceLanguage,
      selectedTranslationLanguage: null,
      availableSourceLanguages,
      availableTranslationLanguages: filteredAvailableTranslationLanguages,
      isLoading,
      isFetching,
      isError,
    };
  }

  const fallbackTranslation =
    preferredTranslationLanguage &&
    filteredAvailableTranslationLanguages.includes(preferredTranslationLanguage)
      ? preferredTranslationLanguage
      : filteredAvailableTranslationLanguages[0];

  const selectedTranslationLanguage =
    translationLanguageParam &&
    filteredAvailableTranslationLanguages.includes(translationLanguageParam)
      ? translationLanguageParam
      : fallbackTranslation;

  return {
    selectedSourceLanguage,
    selectedTranslationLanguage,
    availableSourceLanguages,
    availableTranslationLanguages: filteredAvailableTranslationLanguages,
    isLoading,
    isFetching,
    isError,
  };
}

export const DEFAULT_LANGUAGES_RESPONSE: LanguagesResponse = {
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};
