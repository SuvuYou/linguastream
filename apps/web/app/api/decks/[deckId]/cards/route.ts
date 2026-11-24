import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { deckId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await db.deck.findFirst({
    where: { id: deckId, user_id: user.id },
    select: { id: true },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") ?? "0");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const lang = req.nextUrl.searchParams.get("lang") ?? undefined;
  const q = req.nextUrl.searchParams.get("q") ?? undefined;

  const where = {
    deck_id: deckId,
    user_id: user.id,
    ...(lang ? { source_language: lang } : {}),
    ...(q ? { word: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [cards, total] = await Promise.all([
    db.card.findMany({
      where,
      take: limit,
      skip: page * limit,
      orderBy: { created_at: "desc" },
      include: { word_profile: true },
    }),
    db.card.count({ where }),
  ]);

  const mediaIds = [...new Set(cards.map((c) => c.media_content_id))];
  const mediaItems = await db.mediaContent.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, youtube_video_id: true },
  });

  // Only YouTube items have a source now; streamUrl stays in the response for
  // the Plyr player until uploads return (D-066).
  const urlMap = new Map(
    mediaItems.map((m) => [
      m.id,
      { url: null, videoId: m.youtube_video_id ? m.youtube_video_id : null },
    ]),
  );

  return NextResponse.json({
    cards: cards.map((card) => ({
      ...card,
      streamUrl: urlMap.get(card.media_content_id)?.url ?? null,
      videoId: urlMap.get(card.media_content_id)?.videoId ?? null,
    })),
    total,
    pageCount: Math.ceil(total / limit),
    page,
    limit,
  });
}
