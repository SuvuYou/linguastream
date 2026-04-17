import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  fetchJellyfinLibrary,
  getThumbnailUrl,
} from "@/lib/db-helpers/jellyfin";
import {
  fetchPublicMediaContent,
  fetchUnregisteredMediaContent,
} from "@/lib/db-helpers/media";
import {
  FETCH_LIBRARY_API_PARAMS_SCHEMA,
  parseSearchParamsSafe,
} from "@/helpers/params-schema";
import { PAGE_SIZE } from "@/helpers/const";
import type { JellyfinItem } from "@/types";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;

  const parsedParams = parseSearchParamsSafe(
    FETCH_LIBRARY_API_PARAMS_SCHEMA,
    searchParams,
  );

  if (!parsedParams) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const {
    q: query,
    selectedSrc: sourceLanguage,
    // selectedSub: subtitleLanguage,
    unreg: shouldShowUnregistered,
    page,
  } = parsedParams;

  // Fetch DB items based on mode
  const {
    items: dbItems,
    total,
    pageCount,
  } = user.is_admin && shouldShowUnregistered
    ? await fetchUnregisteredMediaContent({
        searchTerm: query,
        page,
        pageSize: PAGE_SIZE,
      })
    : await fetchPublicMediaContent({
        searchTerm: query,
        sourceLanguage,
        // subtitleLanguage, // TODO: re-enable subtitle language filter when we have more subtitle data
        page,
        pageSize: PAGE_SIZE,
      });

  // Fetch Jellyfin data for current page items
  const jellyfinIds = dbItems
    .map((i) => i.jellyfin_id)
    .filter(Boolean) as string[];

  let jellyfinItems: JellyfinItem[] = [];

  try {
    jellyfinItems =
      jellyfinIds.length > 0
        ? await fetchJellyfinLibrary({ ids: jellyfinIds })
        : [];
  } catch {
    jellyfinItems = [];
  }

  const jellyfinMap = new Map(jellyfinItems.map((i) => [i.Id, i]));

  const items = dbItems.map((dbItem) => ({
    ...dbItem,
    jellyfinItem: jellyfinMap.get(dbItem.jellyfin_id ?? ""),
    thumbnailUrl: getThumbnailUrl(dbItem.jellyfin_id ?? ""),
  }));

  // TODO: handle case where jellyfin item has been deleted but db entry still exists

  return NextResponse.json({
    items,
    total,
    pageCount,
  });
}
