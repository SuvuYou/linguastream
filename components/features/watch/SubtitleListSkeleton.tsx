import { Skeleton } from "@/components/ui/skeleton";

export default function SubtitleListSkeleton() {
  return (
    <div className="">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} data-testid="skeleton-item" className="p-3">
          <Skeleton className="w-full h-22" />
        </div>
      ))}
    </div>
  );
}
