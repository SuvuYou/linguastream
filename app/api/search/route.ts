import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import type { SubtitleSearchDocument } from "@/lib/db-helpers/search";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lang = req.nextUrl.searchParams.get("lang");

  if (!q.trim()) return NextResponse.json({ results: [] });

  const filters = [`(is_global = true OR owner_user_id = "${user.id}")`];

  if (lang) filters.push(`language = "${lang}"`);

  const result = await meili
    .index(SUBTITLE_INDEX)
    .search<SubtitleSearchDocument>(q, {
      limit: 30,
      filter: filters.length > 0 ? filters : undefined,
      attributesToHighlight: ["text"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });

  return NextResponse.json({ results: result.hits });
}
