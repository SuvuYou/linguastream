import Link from "next/link";
import Image from "next/image";
import { fetchJellyfinLibrary, getThumbnailUrl } from "../lib/jellyfin";

export default async function Library() {
  const libraryItems = await fetchJellyfinLibrary();

  return (
    <>
      <div className="flex items-center h-10 border-b border-primary-border px-4 gap-4">
        <span className="text-xs text-secondary-text">
          {libraryItems.length} titles
        </span>
      </div>
      <div className="grid grid-cols-3 border-l border-t border-primary-border">
        {libraryItems.map((item) => (
          <Link
            key={item.Id}
            href={`/watch/${item.Id}`}
            className="border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group"
          >
            <div className="aspect-video bg-background mb-3 overflow-hidden">
              <Image
                src={getThumbnailUrl(item.Id)}
                alt={item.Name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                width={1}
                height={1}
                unoptimized // TODO: Remove when we have a proper jellyfin proxy
              />
            </div>
            <div className="text-sm font-medium truncate">{item.Name}</div>
            <div className="text-xs text-secondary-text mt-1">{item.Type}</div>
          </Link>
        ))}

        {libraryItems.length === 0 && (
          <div className="col-span-3 p-12 text-center text-secondary-text text-sm">
            No items found in your Jellyfin library.
          </div>
        )}
      </div>
    </>
  );
}
