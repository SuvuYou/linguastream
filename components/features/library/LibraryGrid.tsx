"use client";

import { useState } from "react";
import LibrarySkeleton from "@/components/features/library/LibrarySkeleton";
import LibraryCard from "@/components/features/library/LibraryCard";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { useLanguages } from "@/hooks/useLanguages";
import ContentConfigurationModal from "./ContentConfigurationModal";
import type { MergedContentItem } from "@/types";

export default function LibraryGrid() {
  const user = useUser();
  const languages = useLanguages();
  const library = useLibrary({
    enabled:
      !languages.isLoading &&
      !languages.isFetching &&
      !!languages.selectedSourceLanguage,
    selectedSourceLanguage: languages.selectedSourceLanguage!,
    selectedTranslationLanguage: languages.selectedTranslationLanguage!,
  });

  const isLoading = user.isLoading || library.isLoading || languages.isLoading;
  const isError = user.isError || library.isError;
  const { items, total } = library.data || DEFAULT_LIBRARY_RESPONSE;

  const [configModal, setConfigModal] = useState<MergedContentItem | null>(
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
      <span className="w-full relative right-0 text-xs text-secondary-text">
        {total} titles
      </span>

      <div className="grid grid-cols-3 border-l border-t border-primary-border">
        {items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            onOpenConfigModal={(item) => setConfigModal(item)}
          />
        ))}

        {items.length === 0 && (
          <div className="col-span-3 p-12 text-center text-secondary-text text-sm">
            No items found in your Jellyfin library.
          </div>
        )}
      </div>

      {configModal && (
        <ContentConfigurationModal
          item={configModal}
          onClose={() => setConfigModal(null)}
          onSuccess={() => setConfigModal(null)}
        />
      )}
    </>
  );
}
