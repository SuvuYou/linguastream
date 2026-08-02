"use client";

import PersonalCard from "./PersonalCard";
import AddNewCard from "./AddNewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LIBRARY_RESPONSE,
  usePersonalLibrary,
} from "@/hooks/usePersonalLibrary";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { PERSONAL_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import LibrarySkeleton from "@/components/features/library/LibrarySkeleton";

interface CardsGridProps {
  isLanguagesLoading: boolean;
  openAddModal: () => void;
}

export default function CardsGrid({
  isLanguagesLoading,
  openAddModal,
}: CardsGridProps) {
  const { data, isLoading, isError } = usePersonalLibrary();

  const params = useZodSearchParams(PERSONAL_LIBRARY_PARAMS_SCHEMA);

  const { items, pageCount } = data ?? DEFAULT_LIBRARY_RESPONSE;

  if (isLoading || isLanguagesLoading) return <LibrarySkeleton />;

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Failed to load library</EmptyTitle>
          <EmptyDescription>Please try refreshing the page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="max-w-5xl mx-auto px-6 py-8 text-base text-primary-foreground">
          Failed to load content.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <AddNewCard onAdd={() => openAddModal()} />

          {items.map((item) => (
            <PersonalCard key={item.id} item={item} />
          ))}
        </div>
      )}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={params.params.page === 0}
            onClick={() => params.set({ page: params.params.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-xs text-primary-foreground">
            Page {params.params.page + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={params.params.page >= pageCount - 1}
            onClick={() => params.set({ page: params.params.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
