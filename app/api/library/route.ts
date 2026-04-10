import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "@/lib/db-helpers/languages";
import { fetchJellyfinLibrary, getThumbnailUrl } from "@/lib/jellyfin.server";
import {
  fetchPublicMediaContent,
  fetchUnregisteredMediaContent,
} from "@/lib/db-helpers/media";
import {
  parseSearchParams,
  PUBLIC_LIBRARY_PARAMS_SCHEMA,
} from "@/helpers/params-schema";
import { PAGE_SIZE } from "@/helpers/const";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;

  const parsedParams = parseSearchParams(
    PUBLIC_LIBRARY_PARAMS_SCHEMA,
    searchParams,
  );

  const {
    q: query,
    src: sourceLanguage,
    sub: subtitleLanguage,
    unreg: shouldShowUnregistered = false,
    page,
  } = parsedParams;

  // Fetch available languages for validation
  const [availableSource, availableSubtitle] = await Promise.all([
    fetchAvailableSourceLanguages(),
    fetchAvailableSubtitleLanguages(),
  ]);

  const activeSource = availableSource.includes(sourceLanguage)
    ? sourceLanguage
    : availableSource[0];

  const activeSubtitle = availableSubtitle.includes(subtitleLanguage)
    ? subtitleLanguage
    : availableSubtitle[0];

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
        sourceLanguage: activeSource,
        // subtitleLanguage: activeSubtitle, // TODO: re-enable subtitle language filter when we have more subtitle data
        page,
        pageSize: PAGE_SIZE,
      });

  // Fetch Jellyfin data for current page items
  const jellyfinIds = dbItems
    .map((i) => i.jellyfin_id)
    .filter(Boolean) as string[];

  const jellyfinItems =
    jellyfinIds.length > 0
      ? await fetchJellyfinLibrary({ ids: jellyfinIds })
      : [];

  const jellyfinMap = new Map(jellyfinItems.map((i) => [i.Id, i]));

  const items = dbItems.map((dbItem) => ({
    ...dbItem,
    jellyfinItem: jellyfinMap.get(dbItem.jellyfin_id ?? ""),
    thumbnailUrl: getThumbnailUrl(dbItem.jellyfin_id ?? ""),
  }));

  return NextResponse.json({
    items,
    total,
    pageCount,
    activeSource,
    activeSubtitle,
    availableSource,
    availableSubtitle,
  });
}
