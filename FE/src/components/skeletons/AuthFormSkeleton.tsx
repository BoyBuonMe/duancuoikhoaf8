import { Skeleton } from "@/components/ui/skeleton";

const sk = "rounded-md bg-store-surface";
const skMuted = "rounded-md bg-store-surface-2";

export function AuthFormSkeleton() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-store-paper">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-16">
        <Skeleton className={`mb-6 h-8 w-40 ${sk}`} />
        <Skeleton className={`h-4 w-36 ${sk}`} />
        <Skeleton className={`mt-3 h-4 w-full max-w-sm ${skMuted}`} />
        <Skeleton className={`mt-1 h-4 w-4/5 max-w-sm ${skMuted}`} />

        <div className="mt-10 flex w-full flex-col gap-4">
          <Skeleton className={`h-14 w-full rounded-lg ${skMuted}`} />
          <Skeleton className={`h-14 w-full rounded-lg ${skMuted}`} />
          <Skeleton className={`mt-2 h-12 w-full rounded-lg ${sk}`} />
        </div>

        <Skeleton className={`mt-8 h-4 w-48 ${skMuted}`} />
      </div>
    </main>
  );
}
