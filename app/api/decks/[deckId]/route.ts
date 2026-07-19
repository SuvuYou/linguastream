import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const { deckId } = await params;

  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deck = await db.deck.findUnique({
    where: { id: deckId },
    select: { id: true, name: true, is_default: true, user_id: true },
  });

  if (!deck || deck.user_id !== user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const allLangs = await db.card.findMany({
    where: { deck_id: deckId, user_id: user.id },
    select: { source_language: true },
    distinct: ["source_language"],
  });

  return NextResponse.json({
    deck,
    availableLanguages: allLangs.map((l) => l.source_language),
  });
}
