import { useAvailableLanguages } from "./useAvailableLanguages";
import { useAppStore } from "@/lib/initializations/store";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { resolveLanguages } from "@/helpers/language-resolver";

export function useLibraryLanguages() {
  const query = useAvailableLanguages();

  const {
    preferredSourceLanguage,
    preferredTranslationLanguage,
    setPreferredSourceLanguage,
    setPreferredTranslationLanguage,
  } = useAppStore();

  const libraryParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);

  const data = query.data ?? {
    availableSourceLanguages: [],
    availableTranslationLanguages: [],
  };

  const updateLanguageParam = (type: "src" | "trans", value: string) => {
    if (type === "src") setPreferredSourceLanguage(value);
    if (type === "trans") setPreferredTranslationLanguage(value);

    libraryParams.set({ [type]: value });
  };

  const language = resolveLanguages({
    ...data,

    preferredSourceLanguage,
    preferredTranslationLanguage,

    sourceParam: libraryParams.params.src,
    translationParam: libraryParams.params.trans,
  });

  return {
    ...query,
    source: {
      value: language.sourceLanguage,
      available: language.availableSourceLanguages,
      onChange: (value: string) => updateLanguageParam("src", value),
    },

    translation: {
      value: language.translationLanguage,
      available: language.availableTranslationLanguages,
      onChange: (value: string) => updateLanguageParam("trans", value),
    },
  };
}
