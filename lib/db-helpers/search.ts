import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { db } from "@/lib/initializations/db";
import {
  JELLYFIN_CONTENT_TYPE,
  UNKNOWN_SOURCE_LANGUAGE,
} from "@/helpers/const";

export interface SubtitleSearchDocument {
  id: string;

  // source
  source_subtitle_line_id: string;
  source_text: string;
  source_language: string;

  // translation
  translation_language: string;
  translation_text: string;

  // playback
  start_ms: number;
  end_ms: number;

  // media
  media_content_id: string;
  media_title: string;
  jellyfin_id: string;

  // access
  is_global: boolean;
  owner_user_id: string | null;
}

const MATCH_TOLERANCE_MS = 1000;
const CHUNK_SIZE = 1000;

function linesOverlap(
  sourceStart: number,
  sourceEnd: number,
  targetStart: number,
  targetEnd: number,
): boolean {
  return sourceStart <= targetEnd && sourceEnd >= targetStart;
}

function linesNear(
  sourceStart: number,
  targetStart: number,
  tolerance = MATCH_TOLERANCE_MS,
): boolean {
  return Math.abs(sourceStart - targetStart) <= tolerance;
}

function findMatchingTranslationText(
  sourceLine: {
    start_ms: number;
    end_ms: number;
  },
  translationLines: {
    start_ms: number;
    end_ms: number;
    text: string;
  }[],
): string | null {
  const matches = translationLines.filter(
    (line) =>
      linesOverlap(
        sourceLine.start_ms,
        sourceLine.end_ms,
        line.start_ms,
        line.end_ms,
      ) || linesNear(sourceLine.start_ms, line.start_ms),
  );

  if (!matches.length) return null;

  return matches
    .sort((a, b) => a.start_ms - b.start_ms)
    .map((line) => line.text.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function indexAllSubtitleLines() {
  const index = meili.index(SUBTITLE_INDEX);

  await index.updateSettings({
    searchableAttributes: ["source_text"],
    filterableAttributes: [
      "source_language",
      "translation_language",
      "media_content_id",
      "is_global",
      "owner_user_id",
    ],
    sortableAttributes: ["start_ms"],
  });

  let totalIndexed = 0;
  let cursor: string | undefined;

  while (true) {
    const mediaContents = await db.mediaContent.findMany({
      take: 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        subtitle_tracks: { some: {} },
        source_language: { not: UNKNOWN_SOURCE_LANGUAGE },
      },
      select: {
        id: true,
        title: true,
        jellyfin_id: true,
        type: true,
        user_id: true,
        source_language: true,
        subtitle_tracks: {
          select: {
            id: true,
            language: true,
            is_source: true,
            subtitle_lines: {
              select: {
                id: true,
                text: true,
                start_ms: true,
                end_ms: true,
                index: true,
              },
              orderBy: { index: "asc" },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!mediaContents.length) break;

    console.log(mediaContents.length);

    const documents: SubtitleSearchDocument[] = [];

    for (const media of mediaContents) {
      const sourceTrack = media.subtitle_tracks.find((t) => t.is_source);
      if (!sourceTrack) continue;

      const translationTracks = media.subtitle_tracks.filter(
        (t) => !t.is_source,
      );

      for (const sourceLine of sourceTrack.subtitle_lines) {
        for (const translationTrack of translationTracks) {
          const translationText = findMatchingTranslationText(
            sourceLine,
            translationTrack.subtitle_lines,
          );

          if (!translationText) continue;

          documents.push({
            id: `${sourceLine.id}_${translationTrack.language}`,

            source_subtitle_line_id: sourceLine.id,
            source_text: sourceLine.text.trim(),
            source_language: media.source_language!,

            translation_language: translationTrack.language,
            translation_text: translationText,

            start_ms: sourceLine.start_ms,
            end_ms: sourceLine.end_ms,

            media_content_id: media.id,
            media_title: media.title,
            jellyfin_id: media.jellyfin_id ?? "",

            is_global: media.type === JELLYFIN_CONTENT_TYPE,
            owner_user_id: media.user_id,
          });
        }
      }
    }

    for (let i = 0; i < documents.length; i += CHUNK_SIZE) {
      await index.addDocuments(documents.slice(i, i + CHUNK_SIZE), {
        primaryKey: "id",
      });
    }

    totalIndexed += documents.length;

    cursor = mediaContents[mediaContents.length - 1]?.id;
  }

  return {
    indexed: totalIndexed,
    match_tolerance_ms: MATCH_TOLERANCE_MS,
    chunk_size: CHUNK_SIZE,
  };
}
