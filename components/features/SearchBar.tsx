"use client";

import { useRef, useTransition } from "react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { searchParamsSchema } from "@/helpers/params-schema";

export default function SearchBar({ defaultQuery }: { defaultQuery: string }) {
  const searchParams = useZodSearchParams(searchParamsSchema);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        if (newQuery) {
          searchParams.set({ q: newQuery });
        } else {
          searchParams.remove("q");
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
