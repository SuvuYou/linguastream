import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import {
  YOUTUBE_CONTENT_TYPE,
  UPLOAD_CONTENT_TYPE,
  PAGE_SIZE,
} from "@/helpers/const";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "0");
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const type = req.nextUrl.searchParams.get("type") ?? undefined;
  const sourceLang = req.nextUrl.searchParams.get("src") ?? undefined;

  const where = {
    user_id: user.id,
    type: type
      ? { equals: type }
      : { in: [YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE] },
    ...(sourceLang ? { source_language: sourceLang } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    db.mediaContent.findMany({
      where,
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        source_language: true,
        youtube_video_id: true,
        file_path: true,
        job_status: true,
        job_progress: true,
        subtitle_tracks: { select: { language: true } },
      },
    }),
    db.mediaContent.count({ where }),
  ]);

  const itemsWithThumbnails = items.map((item) => ({
    ...item,
    thumbnailUrl:
      item.type === YOUTUBE_CONTENT_TYPE && item.youtube_video_id
        ? `https://img.youtube.com/vi/${item.youtube_video_id}/maxresdefault.jpg`
        : null,
  }));

  return NextResponse.json({
    items: itemsWithThumbnails,
    total,
    pageCount: Math.ceil(total / PAGE_SIZE),
  });
}
