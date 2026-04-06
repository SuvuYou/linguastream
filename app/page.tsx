import { fetchJellyfinLibrary, getThumbnailUrl } from "../lib/jellyfin.server";
import SearchBar from "@/components/features/SearchBar";
import { db } from "@/lib/db";
import LibraryGrid from "@/components/features/LibraryGrid";
import { MediaContent } from "@prisma/client";

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = (await searchParams) || {};

  const [libraryItems, publicMediaContent, user] = await Promise.all([
    fetchJellyfinLibrary({ searchTerm: query }),
    db.mediaContent.findMany({ where: { type: "jellyfin" } }),
    db.user.findUnique({ where: { id: process.env.TEMP_USER_ID! } }),
  ]);

  const publicMediaContentMap: Map<string, MediaContent> = new Map(
    publicMediaContent
      .filter((item) => !!item.jellyfin_id)
      .map((item): [string, MediaContent] => [item.jellyfin_id!, item]),
  );

  const isAdmin = user?.is_admin;

  const premappedLibraryItems = libraryItems.map((item) => ({
    ...item,
    thumbnailUrl: getThumbnailUrl(item.Id),
  }));

  return (
    <>
      <div className="flex items-center h-10 border-b border-primary-border px-4 gap-4">
        <SearchBar defaultQuery={query || ""} />
      </div>
      <div className="flex items-center h-10 border-b border-primary-border px-4 gap-4">
        <span className="text-xs text-secondary-text">
          {libraryItems.length} titles
        </span>
      </div>
      <LibraryGrid
        libraryItems={premappedLibraryItems}
        isAdmin={isAdmin}
        publicMediaContentMap={publicMediaContentMap}
      />
    </>
  );
}
