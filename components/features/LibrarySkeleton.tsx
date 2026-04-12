export default function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-3 border-l border-t border-primary-border">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="border-r border-b border-primary-border p-4">
          <div className="aspect-video bg-background mb-3 animate-pulse" />
          <div className="h-3 bg-background rounded animate-pulse w-3/4 mb-2" />
          <div className="h-2 bg-background rounded animate-pulse w-1/4" />
        </div>
      ))}
    </div>
  );
}
