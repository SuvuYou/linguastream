"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddToLibraryModal from "@/components/features/admin/AddToLibraryModal";
import LibrarySkeleton from "@/components/features/library/LibrarySkeleton";
import LibraryCard from "@/components/features/library/LibraryCard";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { useLanguages } from "@/hooks/useLanguages";

export default function LibraryGrid() {
  const user = useUser();
  const languages = useLanguages();
  const library = useLibrary({
    enabled:
      !languages.isLoading &&
      !languages.isFetching &&
      !!languages.selectedSourceLanguage,
    selectedSourceLanguage: languages.selectedSourceLanguage!,
    selectedSubtitleLanguage: languages.selectedSubtitleLanguage!,
  });

  const isLoading = user.isLoading || library.isLoading || languages.isLoading;
  const isError = user.isError || library.isError;
  const { items, total } = library.data || DEFAULT_LIBRARY_RESPONSE;

  const router = useRouter();

  const [addModal, setAddModal] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [subtitleModal, setSubtitleModal] = useState<{
    id: string;
    title: string;
  } | null>(null);

  if (isLoading) return <LibrarySkeleton />;

  if (isError || !library.data) {
    return (
      <div className="p-12 text-center text-sm text-secondary-text">
        Failed to load library.
      </div>
    );
  }

  return (
    <>
      <span className="w-full relative right-0 text-xs text-secondary-text">
        {total} titles
      </span>

      <div className="grid grid-cols-3 border-l border-t border-primary-border">
        {items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            libraryQueryKey={library.useLibraryQueryKey}
            onAddToLibrary={(id, title) => setAddModal({ id, title })}
            onOpenSubtitleModal={(id, title) => setSubtitleModal({ id, title })}
          />
        ))}

        {items.length === 0 && (
          <div className="col-span-3 p-12 text-center text-secondary-text text-sm">
            No items found in your Jellyfin library.
          </div>
        )}
      </div>

      {addModal && (
        <AddToLibraryModal
          jellyfinId={addModal.id}
          title={addModal.title}
          OnClose={() => setAddModal(null)}
          OnSuccess={() => {
            setAddModal(null);
            router.refresh();
          }}
        />
      )}

      {/* subtitle modal — TODO: wire up in next step */}
      {subtitleModal && <div>{/* SubtitleModal coming next */}</div>}
    </>
  );
}
