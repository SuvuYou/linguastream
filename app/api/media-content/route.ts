import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/initializations/db";
import { z } from "zod";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  JELLYFIN_CONTENT_TYPE,
  UNKNOWN_SOURCE_LANGUAGE,
} from "@/helpers/const";

const createSchema = z.object({
  title: z.string(),
  jellyfin_id: z.string(),
  source_language: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, jellyfin_id, source_language } = parsed.data;

  const existing = await db.mediaContent.findFirst({
    where: { jellyfin_id },
  });

  if (existing) {
    if (existing.source_language !== UNKNOWN_SOURCE_LANGUAGE) {
      return NextResponse.json(
        { error: "Already in library" },
        { status: 409 },
      );
    }

    const updated = await db.mediaContent.update({
      where: { id: existing.id },
      data: { source_language, title, user_id: user.id },
    });

    return NextResponse.json(updated);
  }

  const content = await db.mediaContent.create({
    data: {
      title,
      type: JELLYFIN_CONTENT_TYPE,
      jellyfin_id,
      source_language,
      user_id: user.id,
    },
  });

  return NextResponse.json(content);
}
