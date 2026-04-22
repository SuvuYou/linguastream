"use client";

import AddToLibraryModal from "@/components/features/admin/AddToLibraryModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LibrarySkeleton from "@/components/features/library/LibrarySkeleton";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { useLanguages } from "@/hooks/useLanguages";
import LibraryCard from "@/components/features/library/LibraryCard";

export default function LibraryGrid() {
  const user = useUser();

  const languages = useLanguages();

  const library = useLibrary({
    enabled:
      !languages.isLoading &&
      !languages.isFetching &&
      !!languages.selectedSourceLanguage,
    // !!languages.selectedSubtitleLanguage,
    selectedSourceLanguage: languages.selectedSourceLanguage!,
    selectedSubtitleLanguage: languages.selectedSubtitleLanguage!,
  });

  const isLoading = user.isLoading || library.isLoading || languages.isLoading;

  const isError = user.isError || library.isError;

  const { items, total } = library.data || DEFAULT_LIBRARY_RESPONSE;

  const router = useRouter();
  const [modal, setModal] = useState<{ id: string; title: string } | null>(
    null,
  );

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
      <>
        <span className="w-full relative right-0 text-xs text-secondary-text">
          {total} titles
        </span>
      </>
      <div className="grid grid-cols-3 border-l border-t border-primary-border">
        {items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            onAdd={() =>
              setModal({
                id: item.jellyfinItem!.Id,
                title: item.jellyfinItem!.Name,
              })
            }
          />
        ))}

        {items.length === 0 && (
          <div className="col-span-3 p-12 text-center text-secondary-text text-sm">
            No items found in your Jellyfin library.
          </div>
        )}
      </div>
      {modal && (
        <AddToLibraryModal
          jellyfinId={modal.id}
          title={modal.title}
          OnClose={() => setModal(null)}
          OnSuccess={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
