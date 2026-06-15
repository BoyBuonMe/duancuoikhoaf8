"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface WishlistLoginPromptContextValue {
  openLoginPrompt: () => void;
}

const WishlistLoginPromptContext =
  createContext<WishlistLoginPromptContextValue | null>(null);

export function WishlistLoginPromptProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openLoginPrompt = useCallback(() => setOpen(true), []);

  const value = useMemo(() => ({ openLoginPrompt }), [openLoginPrompt]);

  return (
    <WishlistLoginPromptContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md gap-0 border-zinc-800 bg-zinc-950 px-8 py-10 text-white sm:max-w-lg [&_[data-slot=dialog-close]]:text-zinc-400 [&_[data-slot=dialog-close]]:hover:text-white">
          <DialogTitle className="sr-only">Please log in</DialogTitle>

          <div className="flex flex-col items-center text-center">
            <div
              className="mb-5 flex size-20 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30"
              aria-hidden
            >
              <CircleAlert className="size-10 text-amber-400" strokeWidth={1.75} />
            </div>

            <h2 className="text-lg font-bold uppercase tracking-widest text-white sm:text-xl">
              Please log in
            </h2>

            <DialogDescription className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Sign in to save items to your wishlist.
            </DialogDescription>

            <Button
              asChild
              className="mt-8 h-12 w-full max-w-xs rounded-full bg-white text-sm font-bold uppercase tracking-widest text-black hover:bg-zinc-200"
            >
              <Link href="/account/login" onClick={() => setOpen(false)}>
                Login
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </WishlistLoginPromptContext.Provider>
  );
}

export function useWishlistLoginPrompt() {
  const ctx = useContext(WishlistLoginPromptContext);
  if (!ctx) {
    throw new Error(
      "useWishlistLoginPrompt must be used within WishlistLoginPromptProvider",
    );
  }
  return ctx;
}
