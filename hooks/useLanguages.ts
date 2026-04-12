import {
  FETCH_LANGUAGES_API_PARAMS_SCHEMA,
  parseSearchParams,
} from "@/helpers/params-schema";
import { useZodSearchParams } from "./useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import type { LanguagesResponse } from "@/types/languages";
import { LANGUAGES } from "@/helpers/const";

export function useLanguages() {
  const { data, isLoading, isFetching, isError } = useQuery<LanguagesResponse>({
    queryKey: ["langauges"],
    queryFn: async () => {
      const response = await fetch(`/api/languages`);

      if (!response.ok) throw new Error("Failed to fetch languages");

      return response.json();
    },
  });

  const { params } = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);

  const parsedParams = parseSearchParams(
    FETCH_LANGUAGES_API_PARAMS_SCHEMA,
    params,
  );

  const { src: sourceLanguage, sub: subtitleLanguage } = parsedParams;
  const { availableSourceLanguages, availableSubtitleLanguages } =
    data || DEFAULT_LANGUAGES_RESPONSE;

  const selectedSourceLanguage = availableSourceLanguages.includes(
    sourceLanguage,
  )
    ? sourceLanguage
    : availableSourceLanguages[0];

  const selectedSubtitleLanguage = availableSubtitleLanguages.includes(
    subtitleLanguage,
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
  availableSourceLanguages: [LANGUAGES[0].code],
  availableSubtitleLanguages: [LANGUAGES[0].code],
};
