import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import { AUTO_DETECT, JOB_STATUS } from "@/helpers/const";
import { spawnIngest } from "@/lib/scripts/spawn-ingest";
import {
  FETCH_SUBTITLES_API_PARAMS_SCHEMA,
  parseSearchParamsSafe,
  PUT_INGEST_SUBTITLES_API_PARAMS_SCHEMA,
} from "@/helpers/params-schema";

interface Params {
  params: Promise<{ mediaContentId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { mediaContentId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  const parsedParams = parseSearchParamsSafe(
    FETCH_SUBTITLES_API_PARAMS_SCHEMA,
    searchParams,
  );

  const { lang: translationLanguage } = parsedParams || {};

  if (!parsedParams || !translationLanguage) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const media = await db.mediaContent.findUnique({
    where: { id: mediaContentId },
    select: { user_id: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const track = await db.subtitleTrack.findUnique({
    where: {
      media_content_id_translation_language: {
        media_content_id: mediaContentId,
        translation_language: translationLanguage,
      },
    },
    select: { id: true },
  });

  if (!track) {
    return NextResponse.json(
      { error: `No subtitle track found for language: ${translationLanguage}` },
      { status: 404 },
    );
  }

  const lines = await db.subtitleLine.findMany({
    where: { subtitle_track_id: track.id },
    select: {
      index: true,
      start_ms: true,
      end_ms: true,
      text: true,
    },
    orderBy: { index: "asc" },
  });

  return NextResponse.json({ translationLanguage, lines });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { mediaContentId } = await params;

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

  const parsed = PUT_INGEST_SUBTITLES_API_PARAMS_SCHEMA.safeParse(body);
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
    where: { id: mediaContentId },
    select: {
      user_id: true,
      job_status: true,
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

  if (data.acquisitionMethod === "upload" && !data.sourceFile) {
    return NextResponse.json(
      { error: "sourceFile required when acquisitionMethod is upload" },
      { status: 400 },
    );
  }

  if (data.acquisitionMethod === "whisperx" && !data.videoFilePath) {
    return NextResponse.json(
      { error: "No video file path available for this item" },
      { status: 400 },
    );
  }

  if (data.removeLangs && data.removeLangs.length > 0) {
    const tracksToRemove = await db.subtitleTrack.findMany({
      where: {
        media_content_id: mediaContentId,
        translation_language: { in: data.removeLangs },
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
      where: { id: mediaContentId },
      data: { source_language: data.sourceLang },
    });
  }

  await db.mediaContent.update({
    where: { id: mediaContentId },
    data: { job_status: JOB_STATUS.PENDING, job_progress: 0 },
  });

  try {
    const { logFile } = spawnIngest({
      mediaId: mediaContentId,
      sourceLang: data.sourceLang,
      acquisitionMethod: data.acquisitionMethod,
      sourceFile: data.acquisitionMethod == "upload" ? data.sourceFile : "",
      videoFile: data.acquisitionMethod == "whisperx" ? data.videoFilePath : "",
      translateLangs: data.translateLangs,
      translateMethod: data.translateMethod,
      translateFiles: data.translateFiles,
    });

    await db.mediaContent.update({
      where: { id: mediaContentId },
      data: { job_logs: logFile },
    });
  } catch {
    await db.mediaContent.update({
      where: { id: mediaContentId },
      data: { job_status: JOB_STATUS.ERROR, job_progress: 0 },
    });
    return NextResponse.json(
      { error: "Failed to start ingestion job" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
