const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;
const JELLYFIN_USER_ID = process.env.JELLYFIN_USER_ID;

if (!JELLYFIN_URL || !JELLYFIN_API_KEY || !JELLYFIN_USER_ID) {
  throw new Error(
    "Missing JELLYFIN_URL or JELLYFIN_API_KEY or JELLYFIN_USER_ID in .env.local",
  );
}

const headers = {
  "X-Emby-Token": JELLYFIN_API_KEY,
  "Content-Type": "application/json",
};

export interface JellyfinItem {
  Id: string;
  Name: string;
  Type: string;
  RunTimeTicks?: number;
  ProductionYear?: number;
  ImageTags?: { Primary?: string };
  MediaSources?: JellyfinMediaSource[];
}

export interface JellyfinMediaSource {
  Id: string;
  Name: string;
  Path: string;
  Container: string;
  Size: number;
}

function buildUrl(
  path: string,
  options: Record<string, string | string[] | boolean | number> = {},
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({
    ...options,
    api_key: JELLYFIN_API_KEY,
  })) {
    if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }

  return `${JELLYFIN_URL}${path}?${params}`;
}

export async function fetchJellyfinLibrary(
  params: {
    searchTerm?: string;
  } = {},
): Promise<JellyfinItem[]> {
  const url = buildUrl("/Items", {
    IncludeItemTypes: ["Movie", "Series"],
    Recursive: true,
    Fields: ["MediaSources"],
    StartIndex: 0,
    Limit: 100,
    SortBy: "SortName",
    SortOrder: "Ascending",
    ...(params.searchTerm ? { SearchTerm: params.searchTerm } : {}),
  });

  console.log({
    ...(params.searchTerm ? { SearchTerm: params.searchTerm } : {}),
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
  return buildUrl(`/Videos/${contentId}/stream`, { static: true });
}

export function getThumbnailUrl(itemId: string): string {
  return buildUrl(`/Items/${itemId}/Images/Primary`);
}
