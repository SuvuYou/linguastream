import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import {
  YOUTUBE_CONTENT_TYPE,
  SUBTITLE_ACQUISITION_METHODS,
} from "@/helpers/const";
import { getCurrentUser } from "@/lib/firebase/session";

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, sourceLang } = await req.json();
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
  if (!sourceLang)
    return NextResponse.json(
      { error: "Missing source language" },
      { status: 400 },
    );

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const existing = await db.mediaContent.findFirst({
    where: { youtube_video_id: videoId, user_id: user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This video is already in your library" },
      { status: 409 },
    );
  }

  const oembedRes = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );
  if (!oembedRes.ok) {
    return NextResponse.json(
      { error: "Could not fetch video info. Check the URL and try again." },
      { status: 400 },
    );
  }
  const oembed = await oembedRes.json();

  const media = await db.mediaContent.create({
    data: {
      user_id: user.id,
      title: oembed.title,
      type: YOUTUBE_CONTENT_TYPE,
      source_language: sourceLang,
      source_subtitle_acquisition_method: SUBTITLE_ACQUISITION_METHODS.YOUTUBE,
      youtube_video_id: videoId,
    },
  });

  return NextResponse.json({
    id: media.id,
    title: oembed.title,
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  });
}
