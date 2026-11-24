import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import type { SearchResponse } from "@/types/search";

const DEFAULT_HITS_PER_PAGE = 30;

// Meilisearch was removed (Foundation card [3]). Library search comes back in
// roadmap step C2, built on Postgres lemma arrays and full-text search (D-067).
// Until then the route keeps its shape so the search UI works and finds nothing.
export async function GET() {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const empty: SearchResponse = {
    results: [],
    page: 1,
    totalPages: 0,
    totalHits: 0,
    hitsPerPage: DEFAULT_HITS_PER_PAGE,
  };

  return NextResponse.json(empty);
}
