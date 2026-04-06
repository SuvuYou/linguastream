import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

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

  const { title, jellyfin_id, source_language } = parsed.data;

  const existing = await db.mediaContent.findFirst({
    where: { jellyfin_id },
  });

  if (existing) {
    return NextResponse.json({ error: "Already in library" }, { status: 409 });
  }

  const content = await db.mediaContent.create({
    data: {
      title,
      type: "jellyfin",
      jellyfin_id,
      source_language,
      user_id: process.env.TEMP_USER_ID!,
    },
  });

  return NextResponse.json(content);
}
