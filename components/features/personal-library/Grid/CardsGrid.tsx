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

export default function CardsGrid({
  openAddModal,
}: {
  openAddModal: () => void;
}) {
  const { data, isLoading } = usePersonalLibrary();

  const params = useZodSearchParams(PERSONAL_LIBRARY_PARAMS_SCHEMA);

  const { items, pageCount } = data ?? DEFAULT_LIBRARY_RESPONSE;

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-16/10">
            <AddNewCard onAdd={() => openAddModal()} />
          </div>

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
          <span className="text-xs text-secondary-text">
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
    </>
  );
}
