import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  deckId: z.string().uuid(),
});

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = BodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { deckId } = body.data;

  const deck = await db.deck.findUnique({
    where: {
      id: deckId,
    },
    select: {
      id: true,
      name: true,
      user_id: true,
    },
  });

  if (!deck || deck.user_id !== user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const now = new Date();

  await db.studySession.deleteMany({
    where: {
      expires_at: {
        lt: now,
      },
    },
  });

  const existing = await db.studySession.findFirst({
    where: {
      user_id: user.id,
      deck_id: deckId,
      completed_at: null,
      expires_at: {
        gt: now,
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existing) {
    const reviewedCount = await db.studySessionCard.count({
      where: {
        session_id: existing.id,
        reviewed: true,
      },
    });

    return NextResponse.json({
      sessionId: existing.id,
      deckTitle: deck.name,
      totalDue: existing.total_cards,
      reviewedCount,
      nextReviewAt: null,
    });
  }

  const dueCards = await db.card.findMany({
    where: {
      user_id: user.id,
      deck_id: deckId,
      next_review: {
        lte: now,
      },
    },
    orderBy: [
      {
        next_review: "asc",
      },
      {
        id: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  let nextReviewAt: Date | null = null;

  if (dueCards.length === 0) {
    const nextCard = await db.card.findFirst({
      where: {
        user_id: user.id,
        deck_id: deckId,
      },
      orderBy: {
        next_review: "asc",
      },
      select: {
        next_review: true,
      },
    });

    nextReviewAt = nextCard?.next_review ?? null;
  }

  const session = await db.$transaction(async (tx) => {
    const session = await tx.studySession.create({
      data: {
        user_id: user.id,
        deck_id: deckId,
        expires_at: new Date(now.getTime() + SESSION_DURATION_MS),
        total_cards: dueCards.length,
      },
    });

    if (dueCards.length > 0) {
      await tx.studySessionCard.createMany({
        data: dueCards.map((card, position) => ({
          session_id: session.id,
          card_id: card.id,
          position,
        })),
      });
    }

    return session;
  });

  return NextResponse.json({
    sessionId: session.id,
    deckTitle: deck.name,
    totalDue: session.total_cards,
    reviewedCount: 0,
    nextReviewAt,
  });
}
