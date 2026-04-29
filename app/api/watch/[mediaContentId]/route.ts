import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import {
  fetchJellyfinWatchItem,
  getJellyfinStreamUrl,
} from "@/lib/db-helpers/jellyfin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaContentId: string }> },
) {
  const { mediaContentId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await db.mediaContent.findUnique({
    where: { id: mediaContentId },
    select: {
      id: true,
      user_id: true,
      title: true,
      source_language: true,
      jellyfin_id: true,
      subtitle_tracks: {
        select: { translation_language: true },
      },
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!media.jellyfin_id) {
    return NextResponse.json(
      { error: "No Jellyfin item associated" },
      { status: 400 },
    );
  }

  const streamUrl = getJellyfinStreamUrl(media.jellyfin_id);
  const jellyfinItem = await fetchJellyfinWatchItem(media.jellyfin_id);

  const translationLanguages = media.subtitle_tracks
    .map((t) => t.translation_language)
    .filter((l) => l !== media.source_language);

  return NextResponse.json({
    id: media.id,
    title: jellyfinItem.Name ?? media.title,
    streamUrl,
    sourceLanguage: media.source_language,
    translationLanguages,
  });
}
