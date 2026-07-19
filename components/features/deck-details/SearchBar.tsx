"use client";

import { useRef, useState, useTransition } from "react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { DECK_DETAILS_PARAMS_SCHEMA } from "@/helpers/params-schema";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  const deckDetailsParams = useZodSearchParams(DECK_DETAILS_PARAMS_SCHEMA);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState(deckDetailsParams.params.q ?? "");

  const handleChange = (newQuery: string) => {
    setQuery(newQuery);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        if (newQuery) {
          deckDetailsParams.set({ q: newQuery });
        } else {
          deckDetailsParams.remove("q");
        }
        deckDetailsParams.set({ page: 0 });
      });
    }, 300);
  };

  return (
    <div className="flex flex-1 max-w-196 gap-3 items-center">
      <InputGroup className="min-w-48 max-w-196">
        <Search className="size-4 ml-4" />
        <InputGroupInput
          value={query}
          id="library-search"
          type="text"
          placeholder="Search words in this deck..."
          defaultValue={deckDetailsParams.params.q}
          onChange={(e) => handleChange(e.target.value)}
          aria-busy={isPending}
        />
        {isPending && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Spinner className="size-4" />
            </InputGroupText>
          </InputGroupAddon>
        )}
        {!isPending && deckDetailsParams.params.q && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Button variant={"ghost"} onClick={() => handleChange("")}>
                <X className="size-4" />
              </Button>
            </InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}
