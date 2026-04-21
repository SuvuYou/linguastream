import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import { JOB_STATUS } from "@/types";
import { spawnIngest } from "@/lib/scripts/spawn-ingest";
import { POST_INGEST_SUBTITLES_API_PARAMS_SCHEMA } from "@/helpers/params-schema";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = POST_INGEST_SUBTITLES_API_PARAMS_SCHEMA.safeParse(body);

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
    where: { id: data.mediaId },
    select: { id: true, user_id: true, job_status: true },
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

  await db.mediaContent.update({
    where: { id: data.mediaId },
    data: {
      job_status: JOB_STATUS.PENDING,
      job_progress: 0,
    },
  });

  try {
    const { logFile } = spawnIngest({
      mediaId: data.mediaId,
      sourceLang: data.sourceLang,
      sourceMethod: data.sourceMethod,
      sourceFile: "sourceFile" in data ? data.sourceFile : undefined,
      videoFile: "videoFile" in data ? data.videoFile : undefined,
      translateLangs: data.translateLangs,
      translateMethod: data.translateMethod,
      translateFiles: data.translateFiles,
    });

    await db.mediaContent.update({
      where: { id: data.mediaId },
      data: { job_logs: logFile },
    });
  } catch {
    await db.mediaContent.update({
      where: { id: data.mediaId },
      data: { job_status: JOB_STATUS.ERROR, job_progress: 0 },
    });

    return NextResponse.json(
      { error: "Failed to start ingestion job" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, mediaId: data.mediaId });
}
