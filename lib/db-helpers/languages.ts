import { db } from "@/lib/db";

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
      (item): item is { source_language: string } => !!item.source_language,
    )
    .map((item) => item.source_language);
}

export async function fetchAvailableSubtitleLanguages() {
  const subtitleLanguages = await db.subtitleTrack.findMany({
    select: { subtitle_language: true },
    distinct: ["subtitle_language"],
  });

  return subtitleLanguages.map((item) => item.subtitle_language);
}
