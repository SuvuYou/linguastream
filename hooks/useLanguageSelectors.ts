import {
  AUTO_DETECT,
  LANGUAGES,
  UNKNOWN_SOURCE_LANGUAGE,
} from "@/helpers/const";
import { MergedContentItem } from "@/types";
import { useState } from "react";

interface Args {
  item: MergedContentItem;
  onToggleTranslate: (langCode: string) => void;
}

const getDefaultSourceLanguage = (item: MergedContentItem) =>
  item.source_language && item.source_language !== UNKNOWN_SOURCE_LANGUAGE
    ? item.source_language
    : AUTO_DETECT;

export function useLanguageSelectors(args: Args) {
  const { item } = args;

  const defaultSelectedTranslationLangs = item.subtitle_tracks
    .map((t) => t.language)
    .filter((l) => l !== item.source_language);

  const [selectedTranslateLangs, setSelectedTranslateLangs] = useState<
    Set<string>
  >(new Set(defaultSelectedTranslationLangs));

  const [selectedSourceLang, setSelectedSourceLang] = useState<string>(
    getDefaultSourceLanguage(item),
  );

  const availableTranslationLangs = LANGUAGES.filter(
    (l) => l.code !== selectedSourceLang,
  );

  const removedTranslationLangs = defaultSelectedTranslationLangs.filter(
    (l) => !selectedTranslateLangs.has(l),
  );

  function isTranslationLanguageSelected(langCode: string) {
    return selectedTranslateLangs.has(langCode);
  }

  function isTranslationLanguageExisting(langCode: string) {
    return defaultSelectedTranslationLangs.includes(langCode);
  }

  function toggleTranslateLang(code: string) {
    setSelectedTranslateLangs((prev) => {
      const next = new Set(prev);

      if (next.has(code)) {
        next.delete(code);

        args.onToggleTranslate(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  return {
    data: {
      selectedTranslateLangs,
      selectedSourceLang,
      availableTranslationLangs,
      removedTranslationLangs,
    },
    actions: {
      setSelectedSourceLang,
      toggleTranslateLang,
    },
    checks: {
      isTranslationLanguageSelected,
      isTranslationLanguageExisting,
    },
  };
}
