import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { calculateNextReview } from "@/lib/algorithms/sm2";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";

const BodySchema = z.object({
  cardId: z.string().uuid(),
  rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = BodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { cardId, rating } = body.data;

  const session = await db.studySession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      user_id: true,
      completed_at: true,
      expires_at: true,
    },
  });

  if (
    !session ||
    session.user_id !== user.id ||
    session.completed_at ||
    session.expires_at < new Date()
  ) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const sessionCard = await db.studySessionCard.findUnique({
    where: {
      session_id_card_id: {
        session_id: sessionId,
        card_id: cardId,
      },
    },
    include: {
      card: {
        select: {
          id: true,
          user_id: true,
          repetitions: true,
          interval_days: true,
          ease_factor: true,
        },
      },
    },
  });

  if (!sessionCard || sessionCard.card.user_id !== user.id) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (sessionCard.reviewed) {
    return NextResponse.json(
      { error: "Card already reviewed" },
      { status: 409 },
    );
  }

  const reviewData = calculateNextReview(sessionCard.card, rating);

  const result = await db
    .$transaction(async (tx) => {
      const updateResult = await tx.studySessionCard.updateMany({
        where: {
          session_id: sessionId,
          card_id: cardId,
          reviewed: false,
        },
        data: { reviewed: true },
      });

      if (updateResult.count === 0) {
        throw new Error("ALREADY_REVIEWED");
      }

      await tx.card.update({
        where: { id: cardId },
        data: reviewData,
      });

      const updatedSession = await tx.studySession.update({
        where: { id: sessionId },
        data: { reviewed_cards: { increment: 1 } },
        select: { id: true, reviewed_cards: true, total_cards: true },
      });

      const completed =
        updatedSession.reviewed_cards === updatedSession.total_cards;

      if (completed) {
        await tx.studySession.update({
          where: { id: updatedSession.id },
          data: { completed_at: new Date() },
        });
      }

      return {
        reviewedCount: updatedSession.reviewed_cards,
        totalDue: updatedSession.total_cards,
        progress: updatedSession.reviewed_cards / updatedSession.total_cards,
        completed,
      };
    })
    .catch((err) => {
      if (err.message === "ALREADY_REVIEWED") return null;
      throw err;
    });

  if (result === null) {
    return NextResponse.json(
      { error: "Card already reviewed" },
      { status: 409 },
    );
  }

  return NextResponse.json(result);
}
