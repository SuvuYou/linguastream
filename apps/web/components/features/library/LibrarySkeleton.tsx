import { Skeleton } from "@/components/ui/skeleton";

export default function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 px-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} data-testid="skeleton-item" className="p-4">
          <Skeleton className="aspect-video mb-3" />
          <Skeleton className="h-3 w-3/4 mb-4" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      ))}
    </div>
  );
}
