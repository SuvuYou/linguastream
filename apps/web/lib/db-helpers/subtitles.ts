import { db } from "@/lib/initializations/db";

export async function getSubtitles({
  user,
  mediaContentId,
  language,
}: {
  user: { id: string; is_admin?: boolean };
  mediaContentId: string;
  language: string;
}) {
  const media = await db.mediaContent.findUnique({
    where: { id: mediaContentId },
    select: { user_id: true },
  });

  if (!media) {
    return { error: "Not found", status: 404 };
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return { error: "Forbidden", status: 403 };
  }

  const track = await db.subtitleTrack.findUnique({
    where: {
      media_content_id_language: {
        media_content_id: mediaContentId,
        language,
      },
    },
    select: { id: true },
  });

  if (!track) {
    return {
      error: `No subtitle track found for language: ${language}`,
      status: 404,
    };
  }

  const lines = await db.subtitleLine.findMany({
    where: { subtitle_track_id: track.id },
    orderBy: { index: "asc" },
    select: {
      index: true,
      start_ms: true,
      end_ms: true,
      text: true,
    },
  });

  return {
    data: { language, lines },
    status: 200,
  };
}
