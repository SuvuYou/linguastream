import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { db } from "@/lib/initializations/db";
import { getCurrentUser } from "@/lib/initializations/firebase/session";

const TAIL_LINES = 20; // how many recent log lines to return

function tailFile(filePath: string, n: number): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    return lines.slice(-n);
  } catch {
    return [];
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const media = await db.mediaContent.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      user_id: true,
      job_status: true,
      job_progress: true,
      job_logs: true,
    },
  });

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!user.is_admin && media.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!media.job_status) {
    return NextResponse.json({ status: null, progress: null, logs: [] });
  }

  const logs = media.job_logs ? tailFile(media.job_logs, TAIL_LINES) : [];

  return NextResponse.json({
    status: media.job_status,
    progress: media.job_progress ?? 0,
    logs,
  });
}
