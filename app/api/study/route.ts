import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deckId = req.nextUrl.searchParams.get("deckId");
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  if (!deckId)
    return NextResponse.json({ error: "Missing deckId" }, { status: 400 });

  const deck = await db.deck.findUnique({
    where: { id: deckId },
    select: { user_id: true, name: true },
  });

  if (!deck || deck.user_id !== user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const now = new Date();

  const totalDue = await db.card.count({
    where: { deck_id: deckId, user_id: user.id, next_review: { lte: now } },
  });

  const nextCard =
    totalDue === 0
      ? await db.card.findFirst({
          where: { deck_id: deckId, user_id: user.id },
          orderBy: { next_review: "asc" },
          select: { next_review: true },
        })
      : null;

  const cards = await db.card.findMany({
    where: { deck_id: deckId, user_id: user.id, next_review: { lte: now } },
    orderBy: { next_review: "asc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { word_profile: { select: { part_of_speech: true } } },
  });

  return NextResponse.json({
    cards,
    deckName: deck.name,
    totalDue,
    nextReviewAt: nextCard?.next_review ?? null,
  });
}
