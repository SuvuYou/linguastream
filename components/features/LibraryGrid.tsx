"use client";

import Image from "next/image";
import Link from "next/link";
import AddToLibraryModal from "./AddToLibraryModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import LibrarySkeleton from "./LibrarySkeleton";
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
    // !!languages.selectedSubtitleLanguage,
    selectedSourceLanguage: languages.selectedSourceLanguage!,
    selectedSubtitleLanguage: languages.selectedSubtitleLanguage!,
  });

  const isAdmin = user.data?.is_admin;
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
        {items.map((item) => {
          if (!item.jellyfinItem) {
            return (
              <div
                key={item.id}
                className="relative border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group"
              >
                <div className="aspect-video bg-background mb-3 flex items-center justify-center text-secondary-text">
                  No longer available
                </div>
                <div className="text-sm font-medium truncate">{item.title}</div>
              </div>
            );
          }

          return (
            <div
              key={item.jellyfinItem.Id}
              className="relative border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group"
            >
              <Link href={`/watch/${item.jellyfinItem.Id}`}>
                <div className="aspect-video bg-background mb-3 overflow-hidden">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.jellyfinItem.Name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    width={1}
                    height={1}
                    loading="eager" // TODO: Potentially remove when we have a proper jellyfin proxy
                    unoptimized // TODO: Remove when we have a proper jellyfin proxy
                  />
                </div>
                <div className="text-sm font-medium truncate">
                  {item.jellyfinItem.Name}
                </div>
                <div className="text-xs text-secondary-text mt-1">
                  {item.jellyfinItem.Type}
                </div>
              </Link>
              {isAdmin && item.source_language === UNKNOWN_SOURCE_LANGUAGE && (
                <button
                  onClick={() =>
                    setModal({
                      id: item.jellyfinItem!.Id,
                      title: item.jellyfinItem!.Name,
                    })
                  }
                  className="absolute top-2 right-2 text-xs px-2 py-1 border border-primary-border text-secondary-text hover:text-primary-text  bg-background opacity-0 group-hover:opacity-100 transition-all"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
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
