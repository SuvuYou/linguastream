import { fetchJellyfinLibrary, getThumbnailUrl } from "../lib/jellyfin.server";
import SearchBar from "@/components/features/SearchBar";
import LibraryGrid from "@/components/features/LibraryGrid";
import UnregisteredCheckbox from "@/components/features/UnregisteredCheckbox";
import {
  fetchPublicMediaContent,
  fetchUnregisteredMediaContent,
} from "@/lib/db-helpers/media";
import { fetchAdminUser } from "@/lib/db-helpers/users";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "@/lib/db-helpers/languages";
import LanguageFilter from "@/components/features/LanguageFilter";
import SyncButton from "@/components/features/SyncButton";
import { MergedContentItem } from "@/types";
import { MediaContent } from "@prisma/client";

const PAGE_SIZE = 20;

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    src?: string;
    sub?: string;
    page?: string;
    unreg?: string;
  }>;
}) {
  const {
    q: query,
    src: sourceLanguage,
    sub: subtitleLanguage,
    unreg: showUnregistered,
    page,
  } = (await searchParams) || {};

  const shouldShowUnregistered = showUnregistered === "true";

  // Step 1: Fetch available languages
  const [availableSourceLanguages, availableSubtitleLanguages, adminUser] =
    await Promise.all([
      fetchAvailableSourceLanguages(),
      fetchAvailableSubtitleLanguages(),
      fetchAdminUser(),
    ]);

  const isAdmin = adminUser?.is_admin;

  const selectedSourceLanguage =
    availableSourceLanguages.find((lang) => lang === sourceLanguage) ||
    availableSourceLanguages[0];

  const selectedSubtitleLanguage =
    availableSubtitleLanguages.find((lang) => lang === subtitleLanguage) ||
    availableSubtitleLanguages[0];

  // Step 2: Fetch public media content from DB based on filters
  const { items: dbPublicMediaContent, total } =
    isAdmin && shouldShowUnregistered
      ? await fetchUnregisteredMediaContent({
          page: Number(page) || 0,
          pageSize: PAGE_SIZE,
        })
      : await fetchPublicMediaContent({
          sourceLanguage: selectedSourceLanguage,
          // subtitleLanguage: selectedSubtitleLanguage, // TODO: re-enable subtitle language filter when we have more subtitle data
          page: Number(page) || 0,
          pageSize: PAGE_SIZE,
        });

  console.log("dbPublicMediaContent", dbPublicMediaContent);

  const dbPublicIds = dbPublicMediaContent
    .map((c) => c.jellyfin_id)
    .filter((id): id is string => !!id);

  // Step 3: Fetch corresponding items from Jellyfin
  const jellyfinLibraryItems =
    dbPublicIds.length > 0
      ? await fetchJellyfinLibrary({
          searchTerm: query,
          ids: dbPublicIds,
        })
      : [];

  const mergedPublicMediaContent: MergedContentItem[] = (
    dbPublicMediaContent as MediaContent[]
  ).map((dbItem) => ({
    ...dbItem,
    jellyfinItem: jellyfinLibraryItems.find(
      (item) => item.Id === dbItem.jellyfin_id,
    ),
    thumbnailUrl: getThumbnailUrl(dbItem.jellyfin_id ?? ""),
  }));

  console.log("Merged content items:", mergedPublicMediaContent);

  // TODO: handle case where jellyfin item has been deleted but db entry still exists

  return (
    <>
      <div className="flex items-center h-10 border-b border-primary-border px-4 gap-4">
        <SearchBar defaultQuery={query || ""} />
        {availableSourceLanguages.length > 0 && (
          <LanguageFilter
            availableSourceLanguages={availableSourceLanguages}
            availableSubtitleLanguages={availableSubtitleLanguages}
            selectedSourceLanguage={selectedSourceLanguage}
            selectedSubtitleLanguage={selectedSubtitleLanguage}
          />
        )}
      </div>
      <div className="ml-auto flex items-center gap-4 px-4">
        {isAdmin && <SyncButton />}
        {isAdmin && (
          <UnregisteredCheckbox
            shouldShowUnregistered={shouldShowUnregistered}
          />
        )}
        <span className="text-xs text-secondary-text">{total} titles</span>
      </div>
      <LibraryGrid
        mergedContentItem={mergedPublicMediaContent}
        isAdmin={isAdmin}
      />
      {/* TODO: Pagination controls should go here */}
    </>
  );
}
