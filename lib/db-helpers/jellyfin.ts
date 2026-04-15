import { JellyfinItem } from "@/types";

const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;
const JELLYFIN_USER_ID = process.env.JELLYFIN_USER_ID;

const headers = {
  "X-Emby-Token": JELLYFIN_API_KEY!,
  "Content-Type": "application/json",
};

function buildSafeUrl(
  path: string,
  options: Record<string, string | string[] | boolean | number> = {},
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({
    ...options,
  })) {
    if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }

  return `${JELLYFIN_URL}${path}?${params}`;
}

function buildUrl(
  path: string,
  options: Record<string, string | string[] | boolean | number> = {},
): string {
  return buildSafeUrl(path, { ...options, api_key: JELLYFIN_API_KEY! });
}

export async function fetchJellyfinLibrary(
  params: {
    searchTerm?: string;
    ids?: string[];
    limit?: number;
    startIndex?: number;
  } = {},
): Promise<JellyfinItem[]> {
  const url = buildUrl("/Items", {
    IncludeItemTypes: ["Movie", "Series"],
    Recursive: true,
    Fields: ["MediaSources"],
    SortBy: "SortName",
    SortOrder: "Ascending",
    ...(params.startIndex ? { StartIndex: params.startIndex } : {}),
    ...(params.limit ? { Limit: params.limit } : {}),
    ...(params.searchTerm ? { SearchTerm: params.searchTerm } : {}),
    ...(params.ids ? { Ids: params.ids } : {}),
  });

  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Jellyfin error: ${res.status}`);

  const data = await res.json();
  return data.Items ?? [];
}

export async function fetchJellyfinWatchItem(
  contentId: string,
): Promise<JellyfinItem> {
  const url = buildUrl(`/Items/${contentId}`, {
    Fields: ["MediaSources"],
    UserId: JELLYFIN_USER_ID!,
  });

  const res = await fetch(url, { headers, next: { revalidate: 60 } });

  if (!res.ok) throw new Error(`Jellyfin error: ${res.status}`);

  return res.json();
}

export function getJellyfinStreamUrl(contentId: string): string {
  return buildSafeUrl(`/Videos/${contentId}/stream`, { static: true });
}

export function getThumbnailUrl(itemId: string): string {
  return buildSafeUrl(`/Items/${itemId}/Images/Primary`);
}
