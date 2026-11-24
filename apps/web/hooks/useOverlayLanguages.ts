import { useState } from "react";
import { useAvailableLanguages } from "./useAvailableLanguages";
import { useZodSearchParams } from "./useZodSearchParams";
import { FETCH_LANGUAGES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useAppStore } from "@/lib/initializations/store";
import { resolveLanguages } from "@/helpers/language-resolver";

export function useOverlayLanguages() {
  const query = useAvailableLanguages();

  const { preferredSourceLanguage, preferredTranslationLanguage } =
    useAppStore();

  const libraryParams = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);

  const data = query.data ?? {
    availableSourceLanguages: [],
    availableTranslationLanguages: [],
  };

  const language = resolveLanguages({
    ...data,

    preferredSourceLanguage,
    preferredTranslationLanguage,

    sourceParam: libraryParams.params.src,
    translationParam: libraryParams.params.trans,
  });

  const [source, setSource] = useState(language.sourceLanguage);
  const [translation, setTranslation] = useState(language.translationLanguage);

  const filteredLanguage = resolveLanguages({
    ...data,

    preferredSourceLanguage: source,
    preferredTranslationLanguage: translation,
  });

  return {
    ...query,
    source: {
      value: filteredLanguage.sourceLanguage,
      available: filteredLanguage.availableSourceLanguages,
      onChange: setSource,
    },

    translation: {
      value: filteredLanguage.translationLanguage,
      available: filteredLanguage.availableTranslationLanguages,
      onChange: setTranslation,
    },
  };
}
