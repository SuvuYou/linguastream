"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  pageCount: number;
  currentPage: number;
  setPage: (newPage: number) => void;
}

export default function CardsPagination({
  pageCount,
  currentPage,
  setPage,
}: Props) {
  return (
    <>
      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(0, currentPage - 1))}
                aria-disabled={currentPage === 0}
                className={
                  currentPage === 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-xs text-primary-foreground px-4 py-2">
                Page {currentPage + 1} of {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage(Math.min(pageCount - 1, currentPage + 1))
                }
                aria-disabled={currentPage >= pageCount - 1}
                className={
                  currentPage >= pageCount - 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
