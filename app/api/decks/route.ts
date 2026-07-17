import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decks = await db.deck.findMany({
    where: { user_id: user.id },
    select: {
      id: true,
      name: true,
      is_default: true,
      created_at: true,
      cards: {
        select: {
          id: true,
          source_language: true,
          next_review: true,
        },
      },
    },
    orderBy: [{ is_default: "desc" }, { created_at: "asc" }],
  });

  return NextResponse.json({ decks });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const deck = await db.deck.create({
    data: { user_id: user.id, name: name.trim(), is_default: false },
  });

  return NextResponse.json(deck);
}
