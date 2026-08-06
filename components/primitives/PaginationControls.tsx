"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  pageCount,
  onPageChange,
}: Props) {
  const [value, setValue] = useState(String(page + 1));

  const displayValue = value ?? String(page + 1);

  if (pageCount <= 1) return null;

  const setPage = (newPage: number, updateValueOnly = false) => {
    setValue(String(newPage + 1));

    if (updateValueOnly) return;

    onPageChange(newPage);
  };

  const changePage = (newPage: number) => {
    if (newPage > pageCount - 1) {
      if (page === pageCount - 1) {
        setPage(pageCount - 1, true);

        return;
      }

      setPage(pageCount - 1);
      return;
    }

    if (newPage <= 0) {
      if (page === 0) {
        setPage(0, true);

        return;
      }

      setPage(0);
      return;
    }

    setPage(newPage);
  };

  const commit = () => {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return;
    }

    changePage(parsed - 1);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text=""
            onClick={() => setPage(page - 1)}
            aria-disabled={page === 0}
            className={
              page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>

        <PaginationItem>
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1">
            <span className="text-sm text-muted-foreground">Page</span>

            <Input
              type="number"
              min={1}
              max={pageCount}
              value={displayValue}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                switch (e.key) {
                  case "Enter":
                    commit();
                    break;
                }
              }}
              className="
                h-8
                w-14
                border-0
                bg-transparent
                p-0
                text-center
                shadow-none
                focus-visible:ring-0
                [appearance:textfield]
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
              "
            />

            <span className="text-sm text-muted-foreground">
              of {pageCount}
            </span>
          </div>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            text=""
            onClick={() => setPage(page + 1)}
            aria-disabled={page >= pageCount - 1}
            className={
              page >= pageCount - 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
