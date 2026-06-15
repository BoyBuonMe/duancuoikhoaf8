"use client";

import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/model/useAuth";
import { useResolvedWishlistItems } from "@/features/wishlist/hooks/useResolvedWishlistItems";
import { useWishlist } from "@/features/wishlist";

function WishlistIllustration() {
  return (
    <div className="relative mx-auto flex size-[220px] items-center justify-center">
      <div className="absolute size-[180px] rounded-full bg-zinc-800" />
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 220 220"
        fill="none"
        aria-hidden
      >
        <text x="30" y="55" fontSize="14" fill="#6b7280">
          ✦
        </text>
        <text x="165" y="48" fontSize="10" fill="#6b7280">
          ✦
        </text>
        <text x="185" y="120" fontSize="8" fill="#6b7280">
          ○
        </text>
        <text x="22" y="140" fontSize="8" fill="#6b7280">
          ○
        </text>
        <text x="55" y="185" fontSize="14" fill="#6b7280">
          ✦
        </text>
        <text x="140" y="190" fontSize="10" fill="#6b7280">
          ✦
        </text>
      </svg>
      <div className="absolute left-[38px] top-[55px] flex size-[80px] -rotate-6 flex-col overflow-hidden rounded-lg bg-zinc-700 shadow-lg">
        <div className="flex flex-1 items-center justify-center bg-zinc-600">
          <svg
            viewBox="0 0 40 40"
            className="size-8 text-zinc-500"
            fill="currentColor"
            aria-hidden
          >
            <rect x="5" y="5" width="30" height="30" rx="2" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[100px] top-[50px] flex size-[80px] rotate-6 flex-col overflow-hidden rounded-lg bg-zinc-600 shadow-lg">
        <div className="flex flex-1 items-center justify-center bg-zinc-500">
          <svg
            viewBox="0 0 40 40"
            className="size-8 text-zinc-400"
            fill="currentColor"
            aria-hidden
          >
            <rect x="5" y="5" width="30" height="30" rx="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface WishlistCardProps {
  slug: string;
  title: string;
  imageUrl: string;
  onRemove: () => void;
  onGoPay: () => void;
}

function WishlistCard({
  slug,
  title,
  imageUrl,
  onRemove,
  onGoPay,
}: WishlistCardProps) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg bg-zinc-900">
      <Link
        href={`/products/${slug}`}
        className="group flex cursor-pointer flex-col"
      >
        <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-800">
          {imageUrl ? (
            <LazyImage
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600">
              <svg viewBox="0 0 40 40" className="size-10" fill="currentColor">
                <rect x="5" y="5" width="30" height="30" rx="2" />
              </svg>
            </div>
          )}
        </div>
        <h2 className="cursor-pointer px-3 pt-3 text-sm font-semibold leading-snug text-white line-clamp-2 group-hover:underline">
          {title}
        </h2>
      </Link>

      <div className="mt-auto flex gap-2 p-3">
        <button
          type="button"
          onClick={onRemove}
          className="flex flex-1 cursor-pointer items-center justify-center rounded-md bg-red-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={onGoPay}
          className="flex flex-1 cursor-pointer items-center justify-center rounded-md bg-green-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-green-700"
        >
          Go Pay
        </button>
      </div>
    </li>
  );
}

export function WishlistView() {
  const router = useRouter();
  const { isAuthenticated, sessionChecked } = useAuth();
  const { remove, clear } = useWishlist();
  const resolvedItems = useResolvedWishlistItems();
  const items = sessionChecked && isAuthenticated ? resolvedItems : [];
  const productCount = items.length;

  if (sessionChecked && !isAuthenticated) {
    return (
      <div className="-mx-4 -mt-9 min-h-screen bg-zinc-950 sm:-mx-6 lg:-mx-8">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <WishlistIllustration />
            <h2 className="mt-6 text-sm font-bold uppercase tracking-widest text-white">
              You are not logged in
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Sign in to view and manage your saved items.
            </p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              <Link
                href="/account/login"
                className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-9 min-h-screen bg-zinc-950 sm:-mx-6 lg:-mx-8">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-sm font-bold uppercase tracking-widest text-white">
              Your Wishlist
            </h1>
            <span className="text-sm text-zinc-400">
              {productCount} {productCount === 1 ? "Product" : "Products"}
            </span>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-zinc-400 underline-offset-2 hover:underline"
            >
              Clear wishlist
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <WishlistIllustration />

            <h2 className="mt-6 text-sm font-bold uppercase tracking-widest text-white">
              Your Wishlist Is Empty
            </h2>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Tap the heart next to anything you like the look of and we&apos;ll
              save it here. Then when you&apos;re ready, add it to your bag,
              check out, put it on, and then let&apos;s go gym.
            </p>

            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              <Link
                href="/products"
                className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
              >
                Shop Now
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ key, slug, product }) => {
              const title = product?.title ?? slug;
              const imageUrl = product?.imageUrls[0] ?? "";

              return (
                <WishlistCard
                  key={key}
                  slug={slug}
                  title={title}
                  imageUrl={imageUrl}
                  onRemove={() => remove(key)}
                  onGoPay={() =>
                    router.push(`/checkout?slug=${encodeURIComponent(slug)}`)
                  }
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
