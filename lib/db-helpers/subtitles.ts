import { db } from "@/lib/initializations/db";
import { spawnIngest } from "@/lib/scripts/spawn-ingest";

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

export async function ingestSubtitles({
  user,
  mediaContentId,
  data,
}: {
  user: { id: string; is_admin?: boolean };
  mediaContentId: string;
  data: {
    sourceLang: string;
    acquisitionMethod: "upload" | "whisperx";
    sourceFile: string;
    translateLangs: string[];
    translateMethod?: "upload" | "deepl" | "libretranslate";
    translateFiles: Record<string, string>;
    removeLangs: string[];
    videoFilePath?: string;
  };
}) {
  if (data.translateMethod === "deepl" && !user.is_admin) {
    return {
      error: "DeepL translation is restricted to admins",
      status: 403,
    };
  }

  const media = await db.mediaContent.findUnique({
    where: { id: mediaContentId },
    select: {
      user_id: true,
      job_status: true,
    },
  });

  if (!media) {
    return { error: "Media not found", status: 404 };
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return { error: "Forbidden", status: 403 };
  }

  if (media.job_status === "pending" || media.job_status === "running") {
    return {
      error: "A subtitle job is already running for this item",
      status: 409,
    };
  }

  if (data.acquisitionMethod === "upload" && !data.sourceFile) {
    return {
      error: "sourceFile required when acquisitionMethod is upload",
      status: 400,
    };
  }

  if (data.acquisitionMethod === "whisperx" && !data.videoFilePath) {
    return { error: "No video file path available for this item", status: 400 };
  }

  if (data.removeLangs?.length) {
    const tracks = await db.subtitleTrack.findMany({
      where: {
        media_content_id: mediaContentId,
        language: { in: data.removeLangs },
      },
      select: { id: true },
    });

    const ids = tracks.map((t) => t.id);

    await db.$transaction([
      db.subtitleLine.deleteMany({
        where: { subtitle_track_id: { in: ids } },
      }),
      db.subtitleTrack.deleteMany({
        where: { id: { in: ids } },
      }),
    ]);
  }

  await db.mediaContent.update({
    where: { id: mediaContentId },
    data: { job_status: "pending", job_progress: 0 },
  });

  try {
    const { logFile } = spawnIngest({
      mediaId: mediaContentId,
      ...data,
    });

    await db.mediaContent.update({
      where: { id: mediaContentId },
      data: { job_logs: logFile },
    });
  } catch {
    await db.mediaContent.update({
      where: { id: mediaContentId },
      data: { job_status: "error", job_progress: 0 },
    });

    return { error: "Failed to start ingestion job", status: 500 };
  }

  return { data: { ok: true }, status: 200 };
}
