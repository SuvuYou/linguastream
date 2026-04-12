import { FETCH_LANGUAGES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "./useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LanguagesResponse } from "@/types/languages";

export function useLanguages() {
  const { data, isLoading, isFetching, isError } = useQuery<LanguagesResponse>({
    queryKey: ["langauges"],
    queryFn: async () => {
      const response = await fetch(`/api/languages`);

      if (!response.ok) throw new Error("Failed to fetch languages");

      return response.json();
    },
  });

  const { availableSourceLanguages, availableSubtitleLanguages } =
    data || DEFAULT_LANGUAGES_RESPONSE;

  const { params } = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);
  const { src: sourceLanguage, sub: subtitleLanguage } = params;

  if (
    availableSourceLanguages.length == 0
    // availableSubtitleLanguages.length == 0
  ) {
    return {
      selectedSourceLanguage: null,
      selectedSubtitleLanguage: null,
      availableSourceLanguages,
      availableSubtitleLanguages,
      data: null,
      isLoading,
      isFetching,
      isError,
    };
  }

  if (
    !sourceLanguage
    //|| !subtitleLanguage
  ) {
    return {
      selectedSourceLanguage: null,
      selectedSubtitleLanguage: null,
      availableSourceLanguages,
      availableSubtitleLanguages,
      data: null,
      isLoading,
      isFetching,
      isError,
    };
  }

  const selectedSourceLanguage = availableSourceLanguages.includes(
    sourceLanguage,
  )
    ? sourceLanguage
    : availableSourceLanguages[0];

  const selectedSubtitleLanguage = availableSubtitleLanguages.includes(
    subtitleLanguage || "",
  )
    ? subtitleLanguage
    : availableSubtitleLanguages[0];

  return {
    selectedSourceLanguage,
    selectedSubtitleLanguage,
    availableSourceLanguages,
    availableSubtitleLanguages,
    data,
    isLoading,
    isFetching,
    isError,
  };
}

export const DEFAULT_LANGUAGES_RESPONSE: LanguagesResponse = {
  availableSourceLanguages: [],
  availableSubtitleLanguages: [],
};
