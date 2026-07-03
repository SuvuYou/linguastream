export interface ResolveLanguageOptions {
  availableSourceLanguages: string[];
  availableTranslationLanguages: string[];

  preferredSourceLanguage?: string | null;
  preferredTranslationLanguage?: string | null;

  sourceParam?: string | null;
  translationParam?: string | null;

  /**
   * Forces a specific source language.
   * Used by the watch page.
   */
  lockedSourceLanguage?: string | null;
}

export interface ResolvedLanguages {
  sourceLanguage: string | null;
  translationLanguage: string | null;

  availableSourceLanguages: string[];
  availableTranslationLanguages: string[];
}

export function resolveLanguages({
  availableSourceLanguages,
  availableTranslationLanguages,

  preferredSourceLanguage,
  preferredTranslationLanguage,

  sourceParam,
  translationParam,

  lockedSourceLanguage,
}: ResolveLanguageOptions): ResolvedLanguages {
  if (
    availableSourceLanguages.length === 0 ||
    availableTranslationLanguages.length === 0
  ) {
    return {
      sourceLanguage: null,
      translationLanguage: null,
      availableSourceLanguages,
      availableTranslationLanguages,
    };
  }

  let sourceLanguage: string | null;

  if (lockedSourceLanguage) {
    sourceLanguage = lockedSourceLanguage;
  } else {
    const fallbackSource =
      preferredSourceLanguage &&
      availableSourceLanguages.includes(preferredSourceLanguage)
        ? preferredSourceLanguage
        : availableSourceLanguages[0];

    sourceLanguage =
      sourceParam && availableSourceLanguages.includes(sourceParam)
        ? sourceParam
        : fallbackSource;
  }

  const filteredTranslations = availableTranslationLanguages.filter(
    (lang) => lang !== sourceLanguage,
  );

  if (filteredTranslations.length === 0) {
    return {
      sourceLanguage,
      translationLanguage: null,
      availableSourceLanguages,
      availableTranslationLanguages: filteredTranslations,
    };
  }

  const fallbackTranslation =
    preferredTranslationLanguage &&
    filteredTranslations.includes(preferredTranslationLanguage)
      ? preferredTranslationLanguage
      : filteredTranslations[0];

  const translationLanguage =
    translationParam && filteredTranslations.includes(translationParam)
      ? translationParam
      : fallbackTranslation;

  return {
    sourceLanguage,
    translationLanguage,
    availableSourceLanguages,
    availableTranslationLanguages: filteredTranslations,
  };
}
