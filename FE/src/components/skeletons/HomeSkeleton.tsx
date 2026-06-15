import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-store-surface";
const skMuted = "rounded-md bg-store-surface-2";

export function HomeSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-store-surface-2 font-sans">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-store-paper px-16 py-32 sm:items-start">
        <Skeleton className={`h-5 w-24 ${sk}`} />
        <div className="flex flex-col items-center gap-6 sm:items-start">
          <Skeleton className={`h-10 w-72 max-w-xs ${sk}`} />
          <Skeleton className={`h-20 w-full max-w-md ${skMuted}`} />
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Skeleton className={`h-12 w-full rounded-full md:w-[158px] ${sk}`} />
          <Skeleton className={`h-12 w-full rounded-full md:w-[158px] ${skMuted}`} />
        </div>
      </main>
    </div>
  );
}
