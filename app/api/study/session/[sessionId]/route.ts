import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  cursor: z.coerce.number().int().min(0).optional(), // last position seen (exclusive), not an offset count
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = QuerySchema.safeParse({
    cursor: req.nextUrl.searchParams.get("cursor") ?? undefined,
    limit: req.nextUrl.searchParams.get("limit") ?? 20,
  });

  if (!query.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { cursor, limit } = query.data;

  const session = await db.studySession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      user_id: true,
      total_cards: true,
      completed_at: true,
      expires_at: true,
    },
  });

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.completed_at) {
    return NextResponse.json({
      cards: [],
      cursor: cursor ?? null,
      nextCursor: null,
    });
  }

  if (session.expires_at < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  const rows = await db.studySessionCard.findMany({
    where: {
      session_id: sessionId,
      reviewed: false,
      ...(cursor !== undefined ? { position: { gt: cursor } } : {}),
    },
    orderBy: { position: "asc" },
    take: limit,
    include: {
      card: {
        include: {
          word_profile: {
            select: { part_of_speech: true },
          },
        },
      },
    },
  });

  const nextCursor =
    rows.length === limit ? rows[rows.length - 1].position : null;

  return NextResponse.json({
    cards: rows.map((row) => row.card),
    cursor: cursor ?? null,
    nextCursor,
  });
}
