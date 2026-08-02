"use client";

import { useRef, useState, useTransition } from "react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { SEARCH_BAR_PARAMS_SCHEMA } from "@/helpers/params-schema";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";

const SearchBarVariants = cva("min-w-48 max-w-196", {
  variants: { size: { md: "h-9", lg: "h-11" } },
  defaultVariants: { size: "md" },
});

interface Props {
  variant?: "md" | "lg";
  placeholder?: string;
}

export default function SearchBar({ variant = "md", placeholder }: Props) {
  const params = useZodSearchParams(SEARCH_BAR_PARAMS_SCHEMA);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState(params.params.q ?? "");

  const handleChange = (newQuery: string) => {
    setQuery(newQuery);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        if (newQuery) {
          params.set({ q: newQuery });
        } else {
          params.remove("q");
        }
        params.set({ page: 0 });
      });
    }, 300);
  };

  return (
    <div className="flex flex-1 max-w-196 gap-3 items-center">
      <InputGroup className={SearchBarVariants({ size: variant })}>
        <Search className="size-4 ml-4" />
        <InputGroupInput
          value={query}
          id="library-search"
          type="text"
          placeholder={placeholder}
          defaultValue={params.params.q}
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
        {!isPending && params.params.q && (
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
