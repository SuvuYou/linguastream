import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import { AUTO_DETECT, JOB_STATUS } from "@/helpers/const";
import { spawnIngest } from "@/lib/scripts/spawn-ingest";

const BodySchema = z.object({
  sourceLang: z.string(),
  sourceMethod: z.enum(["upload", "whisperx"]),
  sourceFile: z.string().optional(), // disk path from upload-file route
  translateLangs: z.array(z.string()),
  translateMethod: z.enum(["libretranslate", "deepl", "upload"]),
  translateFiles: z.record(z.string(), z.string()).optional(), // { de: "/path" }
  removeLangs: z.array(z.string()).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { mediaId: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.translateMethod === "deepl" && !user.is_admin) {
    return NextResponse.json(
      { error: "DeepL translation is restricted to admins" },
      { status: 403 },
    );
  }

  const media = await db.mediaContent.findUnique({
    where: { id: params.mediaId },
    select: {
      id: true,
      user_id: true,
      file_path: true,
      job_status: true,
      subtitle_tracks: { select: { subtitle_language: true } },
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    media.job_status === JOB_STATUS.PENDING ||
    media.job_status === JOB_STATUS.RUNNING
  ) {
    return NextResponse.json(
      { error: "A subtitle job is already running for this item" },
      { status: 409 },
    );
  }

  if (data.sourceMethod === "upload" && !data.sourceFile) {
    return NextResponse.json(
      { error: "sourceFile required when sourceMethod is upload" },
      { status: 400 },
    );
  }

  if (data.sourceMethod === "whisperx" && !media.file_path) {
    return NextResponse.json(
      { error: "No video file found for this media item" },
      { status: 400 },
    );
  }

  if (data.removeLangs && data.removeLangs.length > 0) {
    const tracksToRemove = await db.subtitleTrack.findMany({
      where: {
        media_content_id: params.mediaId,
        subtitle_language: { in: data.removeLangs },
      },
      select: { id: true },
    });

    const trackIds = tracksToRemove.map((t) => t.id);

    await db.$transaction([
      db.subtitleLine.deleteMany({
        where: { subtitle_track_id: { in: trackIds } },
      }),
      db.subtitleTrack.deleteMany({
        where: { id: { in: trackIds } },
      }),
    ]);
  }

  if (data.sourceLang !== AUTO_DETECT) {
    await db.mediaContent.update({
      where: { id: params.mediaId },
      data: { source_language: data.sourceLang },
    });
  }

  await db.mediaContent.update({
    where: { id: params.mediaId },
    data: { job_status: JOB_STATUS.PENDING, job_progress: 0 },
  });

  try {
    const { logFile } = spawnIngest({
      mediaId: params.mediaId,
      sourceLang: data.sourceLang,
      acquisitionMethod: data.sourceMethod,
      sourceFile: data.sourceFile,
      videoFile: media.file_path ?? undefined,
      translateLangs: data.translateLangs,
      translateMethod: data.translateMethod,
      translateFiles: data.translateFiles,
    });

    await db.mediaContent.update({
      where: { id: params.mediaId },
      data: { job_logs: logFile },
    });
  } catch {
    await db.mediaContent.update({
      where: { id: params.mediaId },
      data: { job_status: JOB_STATUS.ERROR, job_progress: 0 },
    });
    return NextResponse.json(
      { error: "Failed to start ingestion job" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
