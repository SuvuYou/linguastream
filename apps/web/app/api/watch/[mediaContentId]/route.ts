import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import { YOUTUBE_CONTENT_TYPE } from "@/helpers/const";
import { getCurrentUser } from "@/lib/firebase/session";

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
      type: true,
      source_language: true,
      youtube_video_id: true,
      subtitle_tracks: { select: { language: true } },
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = media.user_id === user.id;
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const translationLanguages = media.subtitle_tracks
    .map((t) => t.language)
    .filter((l) => l !== media.source_language);

  if (media.type === YOUTUBE_CONTENT_TYPE && media.youtube_video_id) {
    return NextResponse.json({
      id: media.id,
      title: media.title,
      type: media.type,
      videoId: media.youtube_video_id,
      sourceLanguage: media.source_language,
      translationLanguages,
    });
  }

  return NextResponse.json(
    { error: "Unsupported content type" },
    { status: 400 },
  );
}
