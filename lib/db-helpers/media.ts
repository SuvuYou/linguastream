import {
  JELLYFIN_CONTENT_TYPE,
  UNKNOWN_SOURCE_LANGUAGE,
} from "@/helpers/const";
import { db } from "@/lib/db";
import { MediaContent } from "@prisma/client";

export async function bulkCreateJellyfinContent(
  items: { jellyfin_id: string; title: string }[],
  userId: string,
) {
  return db.mediaContent.createMany({
    data: items.map((item) => ({
      jellyfin_id: item.jellyfin_id,
      title: item.title,
      type: JELLYFIN_CONTENT_TYPE,
      source_language: UNKNOWN_SOURCE_LANGUAGE,
      user_id: userId,
    })),
    skipDuplicates: true,
  });
}

export async function fetchAllRegisteredJellyfinIds(): Promise<Set<string>> {
  const items = await db.mediaContent.findMany({
    where: { type: JELLYFIN_CONTENT_TYPE },
    select: { jellyfin_id: true },
  });

  return new Set(items.map((i) => i.jellyfin_id).filter(Boolean) as string[]);
}

interface FetchPublicMediaContentOptions {
  searchTerm?: string;
  sourceLanguage?: string;
  subtitleLanguage?: string;
  page: number;
  pageSize: number;
}

export async function fetchPublicMediaContent(
  options: FetchPublicMediaContentOptions,
): Promise<{
  items: MediaContent[];
  total: number;
  pageCount: number;
}> {
  const {
    searchTerm = "",
    sourceLanguage,
    subtitleLanguage,
    page,
    pageSize,
  } = options;

  const where = {
    type: JELLYFIN_CONTENT_TYPE,
    ...(sourceLanguage ? { source_language: sourceLanguage } : {}),
    ...(subtitleLanguage
      ? {
          subtitle_tracks: { some: { subtitle_language: subtitleLanguage } },
        }
      : {}),
    ...(searchTerm
      ? {
          title: { contains: searchTerm, mode: "insensitive" as const },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.mediaContent.findMany({
      where,
      take: pageSize,
      skip: page * pageSize,
      orderBy: { created_at: "desc" },
    }),
    db.mediaContent.count({ where }),
  ]);

  return { items, total, pageCount: Math.ceil(total / pageSize) };
}

export async function fetchUnregisteredMediaContent(options: {
  searchTerm?: string;
  page: number;
  pageSize: number;
}): Promise<{
  items: MediaContent[];
  total: number;
  pageCount: number;
}> {
  const { searchTerm = "", page, pageSize } = options;

  const where = {
    type: JELLYFIN_CONTENT_TYPE,
    source_language: UNKNOWN_SOURCE_LANGUAGE,
    ...(searchTerm
      ? {
          title: { contains: searchTerm, mode: "insensitive" as const },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.mediaContent.findMany({
      where,
      take: pageSize,
      skip: page * pageSize,
      orderBy: { created_at: "desc" },
    }),
    db.mediaContent.count({ where }),
  ]);

  return { items, total, pageCount: Math.ceil(total / pageSize) };
}
