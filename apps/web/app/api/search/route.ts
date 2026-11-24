import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import {
  parseSearchParamsSafe,
  SEARCH_PARAMS_SCHEMA,
} from "@/helpers/params-schema";

const DEFAULT_HITS_PER_PAGE = 30;
const MAX_HITS_PER_PAGE = 100;

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

  if (!q || !q.trim())
    return NextResponse.json({
      results: [],
      page: 1,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: DEFAULT_HITS_PER_PAGE,
    });

  const rawPage = Number(searchParams.get("page"));
  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const rawHitsPerPage = Number(searchParams.get("limit"));
  const hitsPerPage =
    Number.isFinite(rawHitsPerPage) && rawHitsPerPage > 0
      ? Math.min(Math.floor(rawHitsPerPage), MAX_HITS_PER_PAGE)
      : DEFAULT_HITS_PER_PAGE;

  const filters = [`(is_global = true OR owner_user_id = "${user.id}")`];

  if (source) filters.push(`source_language = "${source}"`);
  if (translation) filters.push(`translation_language = "${translation}"`);

  const result = await meili
    .index(SUBTITLE_INDEX)
    .search<SubtitleSearchDocument>(q, {
      page,
      hitsPerPage,
      filter: filters.length > 0 ? filters : undefined,
      attributesToHighlight: ["text"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });

  const isPagedResult = (
    r: typeof result,
  ): r is typeof result & {
    page: number;
    totalPages: number;
    totalHits: number;
    hitsPerPage: number;
  } => "hitsPerPage" in r;

  const pagination = isPagedResult(result)
    ? {
        page: result.page,
        totalPages: result.totalPages,
        totalHits: result.totalHits,
        hitsPerPage: result.hitsPerPage,
      }
    : { page, totalPages: 0, totalHits: 0, hitsPerPage };

  return NextResponse.json({
    results: result.hits,
    ...pagination,
  });
}
