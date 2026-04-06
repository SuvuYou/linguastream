import { fetchJellyfinLibrary, getThumbnailUrl } from "../lib/jellyfin.server";
import SearchBar from "@/components/features/SearchBar";
import LibraryGrid from "@/components/features/LibraryGrid";
import { MediaContent } from "@prisma/client";
import { fetchPublicMediaContent } from "@/lib/db-helpers/media";
import { fetchAdminUser } from "@/lib/db-helpers/users";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "@/lib/db-helpers/languages";
import LanguageFilter from "@/components/features/LanguageFilter";

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; src?: string; sub?: string }>;
}) {
  const {
    q: query,
    src: sourceLanguage,
    sub: subtitleLanguage,
  } = (await searchParams) || {};

  const [availableSourceLanguages, availableSubtitleLanguages, adminUser] =
    await Promise.all([
      fetchAvailableSourceLanguages(),
      fetchAvailableSubtitleLanguages(),
      fetchAdminUser(),
    ]);

  const selectedSourceLanguage =
    availableSourceLanguages.find((lang) => lang === sourceLanguage) ||
    availableSourceLanguages[0];

  const selectedSubtitleLanguage =
    availableSubtitleLanguages.find((lang) => lang === subtitleLanguage) ||
    availableSubtitleLanguages[0];

  const publicMediaContent = await fetchPublicMediaContent(
    selectedSourceLanguage,
    selectedSubtitleLanguage,
  );

  const publicIds = publicMediaContent
    .map((c) => c.jellyfin_id)
    .filter((id): id is string => !!id);

  const libraryItems = await fetchJellyfinLibrary({
    searchTerm: query,
    ids: publicIds,
  });

  const publicMediaContentMap: Map<string, MediaContent> = new Map(
    publicMediaContent
      .filter((item) => !!item.jellyfin_id)
      .map((item): [string, MediaContent] => [item.jellyfin_id!, item]),
  );

  const isAdmin = adminUser?.is_admin;

  const premappedLibraryItems = libraryItems.map((item) => ({
    ...item,
    thumbnailUrl: getThumbnailUrl(item.Id),
  }));

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
