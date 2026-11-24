import { resolveLanguages } from "@/helpers/language-resolver";
import { useAppStore } from "@/lib/initializations/store";
import { FETCH_LANGUAGES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import type { LanguageCode } from "@/helpers/const";

interface WatchLanguagesOptions {
  sourceLanguage: string;
  translationLanguages: string[];
}

export function useWatchLanguages(watchData?: WatchLanguagesOptions) {
  const {
    sourceLanguage,
    translationLanguages: availableTranslationLanguages,
  } = watchData ?? {
    sourceLanguage: "",
    translationLanguages: [],
  };

  const { preferredTranslationLanguage, setPreferredTranslationLanguage } =
    useAppStore();

  const languageParams = useZodSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA);

  const language = resolveLanguages({
    availableSourceLanguages: [sourceLanguage],
    availableTranslationLanguages,

    preferredTranslationLanguage,

    translationParam: languageParams.params.trans,

    lockedSourceLanguage: sourceLanguage,
  });

  const updateTranslationLanguageParam = (value: string) => {
    setPreferredTranslationLanguage(value);

    languageParams.set({ trans: value as LanguageCode });
  };

  return {
    source: {
      value: language.sourceLanguage,
      available: language.availableSourceLanguages,
    },

    translation: {
      value: language.translationLanguage,
      available: language.availableTranslationLanguages,
      onChange: (value: string) => updateTranslationLanguageParam(value),
    },
  };
}
