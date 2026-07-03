"use client";

import { useState } from "react";
import LibrarySkeleton from "@/components/features/library/LibrarySkeleton";
import LibraryCard from "@/components/features/library/LibraryCard";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import ContentConfigurationModal from "@/components/features/library/ContentConfigurationModal/Modal";
import type { MergedContentItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";

export default function LibraryGrid() {
  const user = useUser();
  const languages = useLibraryLanguages();
  const library = useLibrary({
    selectedSourceLanguage: languages.source.value!,
    selectedTranslationLanguage: languages.translation.value!,
    areLanguagesSelected:
      !languages.isLoading &&
      !!languages.source.value &&
      !!languages.translation.value,
  });

  const isLoading = user.isLoading || library.isLoading || languages.isLoading;
  const isError = user.isError || library.isError;
  const { items, total } = library.data || DEFAULT_LIBRARY_RESPONSE;

  const [configModal, setConfigModal] = useState<MergedContentItem | null>(
    null,
  );

  if (isLoading) return <LibrarySkeleton />;

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Failed to load library</EmptyTitle>
          <EmptyDescription>Please try refreshing the page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="px-2 pb-4">
        <Badge variant="secondary" className="text-xs font-normal">
          {total} titles
        </Badge>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 px-2">
        {items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            onOpenConfigModal={(item) => setConfigModal(item)}
          />
        ))}

        {items.length === 0 && (
          <Empty className="col-span-3">
            <EmptyHeader>
              <EmptyTitle>No items found</EmptyTitle>
              <EmptyDescription>
                No items found in your Jellyfin library.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
