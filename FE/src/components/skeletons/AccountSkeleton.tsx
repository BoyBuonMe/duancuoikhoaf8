import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-zinc-300/80";
const skMuted = "rounded-md bg-zinc-200/90";
const skDark = "rounded-md bg-[#CECFD0]";

export function AccountSkeleton() {
  return (
    <div className="-mx-4 -mt-9 sm:-mx-6 lg:-mx-8">
      <section
        className="px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #dbdbdb, #dadbdb)",
          minHeight: "560px",
        }}
      >
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-10 py-14 lg:grid-cols-[280px_1fr_320px] lg:items-center">
          <div>
            <Skeleton className={`mb-8 h-9 w-48 ${sk}`} />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className={`h-[52px] w-full ${skDark}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center py-4 text-center">
            <Skeleton className={`h-28 w-40 ${sk}`} />
            <div className="mt-8 w-full max-w-sm space-y-2">
              <Skeleton className={`h-px w-full ${skMuted}`} />
              <div className="flex justify-between">
                <Skeleton className={`h-3 w-20 ${skMuted}`} />
                <Skeleton className={`h-3 w-24 ${skMuted}`} />
              </div>
            </div>
          </div>

          <div className="p-8">
            <Skeleton className={`mx-auto mb-6 h-3 w-32 ${skMuted}`} />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className={`h-[52px] w-full ${skDark}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-8 grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <section className="bg-[#F5F5F5] p-8">
            <Skeleton className={`mb-8 h-3 w-16 ${sk}`} />
            <div className="flex flex-col items-center py-8 text-center">
              <Skeleton className={`size-[140px] rounded-full ${skMuted}`} />
              <Skeleton className={`mt-6 h-4 w-64 max-w-full ${skMuted}`} />
              <Skeleton className={`mt-2 h-4 w-52 max-w-full ${skMuted}`} />
              <div className="mt-8 flex gap-4">
                <Skeleton className={`h-11 w-32 rounded-full ${sk}`} />
                <Skeleton className={`h-11 w-28 rounded-full ${sk}`} />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className={`min-h-[123px] w-full ${skMuted}`} />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1600px] border-t border-zinc-200 pb-10 pt-6">
          <Skeleton className={`h-4 w-20 ${skMuted}`} />
        </div>
      </div>
    </div>
  );
}
