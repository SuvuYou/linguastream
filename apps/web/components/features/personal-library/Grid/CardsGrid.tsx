"use client";

import PersonalCard from "./PersonalCard";
import AddNewCard from "./AddNewCard";
import { Skeleton } from "@/components/ui/skeleton";
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
import PaginationControls from "@/components/primitives/PaginationControls";

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
    <div className="h-[calc(100vh-92px)] overflow-y-scroll p-4">
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
        <div className="pt-4">
          <PaginationControls
            page={params.params.page}
            pageCount={pageCount}
            onPageChange={(page) => params.set({ page })}
          />
        </div>
      )}
    </div>
  );
}
