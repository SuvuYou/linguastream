import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import { db } from "@/lib/initializations/db";

export async function fetchAvailableSourceLanguages() {
  const sourceLanguages = await db.mediaContent.findMany({
    select: { source_language: true },
    distinct: ["source_language"],
  });

  if (sourceLanguages.length === 0) {
    return [];
  }

  return sourceLanguages
    .filter(
      (item): item is { source_language: string } =>
        !!item.source_language &&
        item.source_language !== UNKNOWN_SOURCE_LANGUAGE,
    )
    .map((item) => item.source_language);
}

export async function fetchAvailableTranslationLanguages() {
  const translationLanguages = await db.subtitleTrack.findMany({
    select: { translation_language: true },
    distinct: ["translation_language"],
  });

  return translationLanguages.map((item) => item.translation_language);
}
