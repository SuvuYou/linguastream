"use client";

import { useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SearchBar({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        if (newQuery) {
          router.replace(`${pathname}?q=${encodeURIComponent(newQuery)}`);
        } else {
          router.replace(pathname);
        }
      });
    }, 300);
  };

  return (
    <div className="flex gap-3 items-center">
      <p className="text-sm text-primary-text">Search: </p>
      <input
        type="text"
        placeholder="Search by title..."
        defaultValue={defaultQuery}
        onChange={handleChange}
        className={`bg-transparent text-sm text-secondary-text placeholder:text-secondary-text outline-none w-48 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      />
    </div>
  );
}
