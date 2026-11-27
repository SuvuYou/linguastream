"use client";

import { LIBRARY_SEARCH_MAX } from "@linguastream/contracts";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 300;

export default function LibrarySearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const change = (next: string, immediate = false) => {
    setDraft(next);
    clearTimeout(timer.current ?? undefined);
    if (immediate) onChange(next.trim());
    else
      timer.current = setTimeout(() => onChange(next.trim()), SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="relative flex h-9 w-full items-center text-sm sm:w-72">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4 text-text-3"
      />
      <input
        ref={input}
        type="search"
        value={draft}
        maxLength={LIBRARY_SEARCH_MAX}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && draft) {
            e.preventDefault();
            change("", true);
          }
        }}
        placeholder="Search by title or channel"
        aria-label="Search the library"
        className="h-full w-full rounded-md border border-border bg-raised pr-9 pl-9 placeholder:text-text-3 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring [&::-webkit-search-cancel-button]:appearance-none"
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            change("", true);
            input.current?.focus();
          }}
          className="absolute right-1 flex size-7 items-center justify-center rounded-sm text-text-3 hover:bg-raised-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
