import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import { calculateNextReview, type SMRating } from "@/lib/algorithms/sm2";

const BodySchema = z.object({
  rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await params;

  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = BodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const card = await db.card.findUnique({
    where: { id: cardId },
    select: {
      user_id: true,
      repetitions: true,
      interval_days: true,
      ease_factor: true,
    },
  });

  if (!card || card.user_id !== user.id) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const result = calculateNextReview(card, body.data.rating as SMRating);

  const updated = await db.card.update({
    where: { id: cardId },
    data: result,
  });

  return NextResponse.json(updated);
}
