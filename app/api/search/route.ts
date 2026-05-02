import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import {
  parseSearchParamsSafe,
  SEARCH_PARAMS_SCHEMA,
} from "@/helpers/params-schema";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;

  const parsedParams = parseSearchParamsSafe(
    SEARCH_PARAMS_SCHEMA,
    searchParams,
  );

  const { q, src: source, trans: translation } = parsedParams || {};

  if (!q || !q.trim()) return NextResponse.json({ results: [] });

  const filters = [`(is_global = true OR owner_user_id = "${user.id}")`];

  if (source) filters.push(`source_language = "${source}"`);
  if (translation) filters.push(`translation_language = "${translation}"`);

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
