"use client";

import { useRef, useTransition } from "react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";

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
    <div className="flex flex-1 max-w-196 gap-3 items-center">
      <InputGroup className="min-w-48 max-w-196">
        <Search className="size-4 ml-4" />
        <InputGroupInput
          id="library-search"
          type="text"
          placeholder="Search by title..."
          defaultValue={searchParams.params.q}
          onChange={handleChange}
          aria-busy={isPending}
        />
        {isPending && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Spinner className="size-4" />
            </InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}
