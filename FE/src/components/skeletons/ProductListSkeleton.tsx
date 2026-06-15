import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-store-surface";
const skMuted = "rounded-md bg-store-surface-2";

function ProductCardSkeleton() {
  return (
    <article className="flex flex-col gap-3">
      <Skeleton
        className={`aspect-2/3 w-full rounded-2xl border border-store-border/40 ${sk}`}
      />
      <Skeleton className={`h-2.5 w-1/3 ${skMuted}`} />
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className={`h-3.5 w-full ${sk}`} />
          <Skeleton className={`h-3.5 w-4/5 ${sk}`} />
        </div>
        <Skeleton className={`h-4 w-10 shrink-0 ${sk}`} />
      </div>
    </article>
  );
}

export function ProductListSkeleton() {
  return (
    <main className="w-full flex-1 bg-store-paper">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-2 border-b border-store-border pb-6 pt-2 sm:pb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <Skeleton className={`h-12 w-2/3 max-w-md sm:h-16 md:h-20 ${sk}`} />
            <Skeleton className={`h-8 w-28 rounded-full ${skMuted}`} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="sticky top-20 z-20 flex w-full gap-2 border-b border-store-border bg-store-paper/95 py-2 backdrop-blur-md lg:hidden">
            <Skeleton className={`h-11 flex-1 rounded-lg ${skMuted}`} />
          </div>

          <aside className="hidden w-64 shrink-0 flex-col gap-6 pr-2 lg:flex">
            <div className="flex items-center justify-between border-b border-store-border pb-3">
              <Skeleton className={`h-3 w-16 ${sk}`} />
            </div>
            <div className="flex flex-col gap-3 border-b border-store-border pb-4">
              <Skeleton className={`h-3 w-20 ${sk}`} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={`h-4 w-full max-w-[140px] ${skMuted}`} />
              ))}
            </div>
          </aside>

          <div className="grid w-full flex-1 grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
