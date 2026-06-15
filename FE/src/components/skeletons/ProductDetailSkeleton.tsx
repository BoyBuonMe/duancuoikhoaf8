import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-store-surface";
const skMuted = "rounded-md bg-store-surface-2";

export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2">
          <Skeleton className={`h-2.5 w-10 ${skMuted}`} />
          <Skeleton className={`h-2.5 w-1 ${skMuted}`} />
          <Skeleton className={`h-2.5 w-16 ${skMuted}`} />
          <Skeleton className={`h-2.5 w-1 ${skMuted}`} />
          <Skeleton className={`h-2.5 w-32 ${sk}`} />
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">
          <div className="grid flex-1 grid-cols-1 gap-1.5 sm:gap-2 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`aspect-2/3 w-full ${sk}`}
              />
            ))}
          </div>

          <div className="shrink-0 lg:w-95 xl:w-110">
            <div className="space-y-8">
              <Skeleton className={`h-10 w-full border-l-4 border-store-border ${skMuted}`} />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className={`h-10 w-4/5 ${sk}`} />
                  <Skeleton className={`size-11 rounded-full ${skMuted}`} />
                </div>
                <Skeleton className={`h-4 w-1/2 ${skMuted}`} />
                <Skeleton className={`h-8 w-24 pt-2 ${sk}`} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className={`h-3 w-20 ${sk}`} />
                  <Skeleton className={`h-3 w-16 ${skMuted}`} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className={`h-12 w-full ${skMuted}`} />
                  ))}
                </div>
              </div>

              <Skeleton className={`h-16 w-full rounded ${sk}`} />

              <div className="space-y-0 divide-y divide-store-border border-t border-store-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-5">
                    <Skeleton className={`h-3 w-36 ${sk}`} />
                    <Skeleton className={`size-5 ${skMuted}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
