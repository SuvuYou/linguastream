import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import { getJellyfinStreamUrl } from "@/lib/db-helpers/jellyfin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaContentId: string }> },
) {
  const { mediaContentId } = await params;

  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const media = await db.mediaContent.findUnique({
    where: { id: mediaContentId },
    select: { user_id: true, jellyfin_id: true, type: true },
  });

  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isPublic = media.type === "jellyfin";
  const isOwner = media.user_id === user.id;

  if (!isPublic && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!media.jellyfin_id) {
    return NextResponse.json({ error: "No stream available" }, { status: 400 });
  }

  return NextResponse.json({
    streamUrl: getJellyfinStreamUrl(media.jellyfin_id),
  });
}
