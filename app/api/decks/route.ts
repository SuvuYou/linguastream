import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sourceLanguage =
    req.nextUrl.searchParams.get("sourceLanguage") ?? undefined;
  const now = new Date();

  const decks = await db.deck.findMany({
    where: { user_id: user.id },
    select: { id: true, name: true, is_default: true, created_at: true },
    orderBy: { created_at: "asc" },
  });

  const cardFilter = {
    user_id: user.id,
    ...(sourceLanguage ? { source_language: sourceLanguage } : {}),
  };

  const [totalByDeck, dueByDeck] = await Promise.all([
    db.card.groupBy({
      by: ["deck_id"],
      where: cardFilter,
      _count: { _all: true },
    }),
    db.card.groupBy({
      by: ["deck_id"],
      where: { ...cardFilter, next_review: { lte: now } },
      _count: { _all: true },
    }),
  ]);

  const totalMap = new Map(totalByDeck.map((r) => [r.deck_id, r._count._all]));
  const dueMap = new Map(dueByDeck.map((r) => [r.deck_id, r._count._all]));

  const result = decks.map((deck) => {
    const total = totalMap.get(deck.id) ?? 0;
    const due = dueMap.get(deck.id) ?? 0;
    const learned = total - due;
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0;

    return {
      ...deck,
      stats: { total, due, learned, progress },
    };
  });

  return NextResponse.json({ decks: result });
}
