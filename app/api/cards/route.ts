import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";

const BodySchema = z.object({
  deck_id: z.string().uuid(),
  media_content_id: z.string().uuid(),
  source_language: z.string().min(2),
  translation_language: z.string().min(2),
  word: z.string().min(1),
  word_translation: z.string().min(1),
  context_text: z.string().min(1),
  context_translation: z.string(),
  contextual_definition: z.string().min(1),
  start_ms: z.number().int(),
  end_ms: z.number().int(),
  word_profile_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = BodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request", details: body.error.flatten() },
      { status: 400 },
    );
  }

  const data = body.data;

  const deck = await db.deck.findUnique({
    where: { id: data.deck_id },
    select: { user_id: true },
  });

  if (!deck || deck.user_id !== user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const existing = await db.card.findFirst({
    where: {
      user_id: user.id,
      deck_id: data.deck_id,
      word: data.word,
      source_language: data.source_language,
    },
  });

  // TODO: think about duplicate words
  if (existing) {
    return NextResponse.json(
      { error: "Word already in this deck" },
      { status: 409 },
    );
  }

  const card = await db.card.create({
    data: {
      user_id: user.id,
      ...data,
      next_review: new Date(),
    },
  });

  return NextResponse.json(card);
}

const DeleteBodySchema = z.object({
  cardIds: z.array(z.string().uuid()).min(1).max(500),
});

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = DeleteBodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ownedCards = await db.card.findMany({
    where: { id: { in: body.data.cardIds }, user_id: user.id },
    select: { id: true },
  });
  const ownedIds = ownedCards.map((c) => c.id);

  if (ownedIds.length === 0) {
    return NextResponse.json(
      { error: "No matching cards found" },
      { status: 404 },
    );
  }

  await db.$transaction(async (tx) => {
    const affectedSessions = await tx.studySessionCard.findMany({
      where: { card_id: { in: ownedIds } },
      select: { session_id: true },
      distinct: ["session_id"],
    });

    if (affectedSessions.length > 0) {
      await tx.studySession.deleteMany({
        where: { id: { in: affectedSessions.map((s) => s.session_id) } },
      });
    }

    await tx.card.deleteMany({ where: { id: { in: ownedIds } } });
  });

  return NextResponse.json({ deletedCount: ownedIds.length });
}
