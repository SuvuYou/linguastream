"use client";

import Image from "next/image";
import type { MergedContentItem } from "@/types";
import Link from "next/link";
import AddToLibraryModal from "./AddToLibraryModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";

export default function LibraryGrid({
  mergedContentItem,
  isAdmin,
}: {
  mergedContentItem: MergedContentItem[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ id: string; title: string } | null>(
    null,
  );

  return (
    <>
      <div className="grid grid-cols-3 border-l border-t border-primary-border">
        {mergedContentItem.map((item) => {
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
        {mergedContentItem.length === 0 && (
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
