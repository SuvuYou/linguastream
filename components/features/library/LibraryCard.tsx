"use client";

import Image from "next/image";
import Link from "next/link";
import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import { useUser } from "@/hooks/useUser";
import type { MergedContentItem } from "@/types";

interface Props {
  item: MergedContentItem;
  onAdd: () => void;
}

export default function LibraryCard({ item, onAdd }: Props) {
  const user = useUser();

  const isAdmin = user.data?.is_admin;

  if (!item.jellyfinItem) {
    return (
      <div className="relative border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group">
        <div className="aspect-video bg-background mb-3 flex items-center justify-center text-secondary-text">
          No longer available
        </div>
        <div className="text-sm font-medium truncate">{item.title}</div>
      </div>
    );
  }

  return (
    <div className="relative border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group">
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
          onClick={onAdd}
          className="absolute top-2 right-2 text-xs px-2 py-1 border border-primary-border text-secondary-text hover:text-primary-text  bg-background opacity-0 group-hover:opacity-100 transition-all"
        >
          + Add
        </button>
      )}
    </div>
  );
}
