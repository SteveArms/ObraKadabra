import { Skeleton } from "@/components/ui/Skeleton";

type PageSkeletonProps = { label: string; variant?: "workspace" | "page" };

// Keeps the layout of the screen that is loading, so nothing jumps when the content arrives
export function PageSkeleton({ label, variant = "page" }: PageSkeletonProps) {
  return (
    <div role="status" data-testid="page-skeleton" className="flex flex-1 flex-col gap-space-md px-gutter py-space-lg lg:px-gutter-desktop">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-1/3 max-w-xs" />
      {variant === "workspace" ? (
        <div className="grid flex-1 gap-space-md lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)]">
          <Skeleton className="h-[45dvh] min-h-72 rounded-lg lg:h-auto" />
          <div className="flex flex-col gap-space-sm">
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      ) : (
        <div className="grid gap-space-md sm:grid-cols-2">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-72 rounded-lg sm:col-span-2" />
        </div>
      )}
    </div>
  );
}
