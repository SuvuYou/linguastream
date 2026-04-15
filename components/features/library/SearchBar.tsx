"use client";

import { useRef, useTransition } from "react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";

export default function SearchBar() {
  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);
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
        defaultValue={searchParams.params.q}
        onChange={handleChange}
        className={`bg-transparent text-sm text-secondary-text placeholder:text-secondary-text outline-none w-48 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      />
    </div>
  );
}
