import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { db } from "@/lib/initializations/db";
import { JELLYFIN_CONTENT_TYPE } from "@/helpers/const";

export interface SubtitleSearchDocument {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  language: string;
  media_content_id: string;
  media_title: string;
  jellyfin_id: string;
  is_global: boolean;
  owner_user_id: string | null;
}

export async function indexAllSubtitleLines() {
  const lines = await db.subtitleLine.findMany({
    where: { subtitle_track: { is_source: true } },
    select: {
      id: true,
      text: true,
      start_ms: true,
      end_ms: true,
      media_content_id: true,
      subtitle_track: {
        select: { language: true },
      },
      media_content: {
        select: { title: true, jellyfin_id: true, type: true, user_id: true },
      },
    },
  });

  const documents: SubtitleSearchDocument[] = lines.map((line) => ({
    id: line.id,
    text: line.text,
    start_ms: line.start_ms,
    end_ms: line.end_ms,
    language: line.subtitle_track.language,
    media_content_id: line.media_content_id,
    media_title: line.media_content.title,
    jellyfin_id: line.media_content.jellyfin_id ?? "",
    is_global: line.media_content.type === JELLYFIN_CONTENT_TYPE,
    owner_user_id: line.media_content.user_id,
  }));

  const index = meili.index(SUBTITLE_INDEX);

  await index.updateSettings({
    searchableAttributes: ["text"],
    filterableAttributes: [
      "language",
      "media_content_id",
      "is_global",
      "owner_user_id",
    ],
    sortableAttributes: ["start_ms"],
  });

  const CHUNK = 1000;
  for (let i = 0; i < documents.length; i += CHUNK) {
    await index.addDocuments(documents.slice(i, i + CHUNK), {
      primaryKey: "id",
    });
  }

  return { indexed: documents.length };
}
