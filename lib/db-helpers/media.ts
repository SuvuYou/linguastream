import { db } from "@/lib/db";

export async function fetchPublicMediaContent(
  sourceLanguage?: string,
  subtitleLanguage?: string,
) {
  return db.mediaContent.findMany({
    where: {
      type: "jellyfin",
      ...(sourceLanguage ? { source_language: sourceLanguage } : {}),
      ...(subtitleLanguage
        ? {
            subtitle_tracks: {
              some: { subtitle_language: subtitleLanguage },
            },
          }
        : {}),
    },
  });
}
