import { Skeleton } from "./skeleton";

interface CardSkeletonProps {
  rows?: number;
  variant?: "list" | "grid";
}

export function CardSkeleton({ rows = 3, variant = "list" }: CardSkeletonProps) {
  if (variant === "list") {
    return (
      <div className="space-y-3 animate-pulse" role="status" aria-label="Loading content...">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-pulse" role="status" aria-label="Loading content...">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="w-full h-40 rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
