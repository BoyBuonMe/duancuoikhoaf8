import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-zinc-800";
const skMuted = "rounded-md bg-zinc-700";

export function WishlistSkeleton() {
  return (
    <div className="-mx-4 -mt-9 min-h-screen bg-zinc-950 sm:-mx-6 lg:-mx-8">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <Skeleton className={`h-4 w-28 ${sk}`} />
            <Skeleton className={`h-4 w-20 ${skMuted}`} />
          </div>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-lg bg-zinc-900 p-4"
            >
              <Skeleton className={`aspect-2/3 w-full rounded-lg ${sk}`} />
              <Skeleton className={`h-4 w-full ${skMuted}`} />
              <Skeleton className={`h-3 w-2/3 ${skMuted}`} />
              <div className="mt-3 flex gap-2">
                <Skeleton className={`h-10 flex-1 rounded-md ${skMuted}`} />
                <Skeleton className={`h-10 flex-1 rounded-md ${skMuted}`} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
