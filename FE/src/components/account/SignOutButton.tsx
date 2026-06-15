"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { logoutApi } from "@/features/auth/api/auth.api";
import { cartApi } from "@/features/cart";
import { useAppDispatch } from "@/store/hooks";
import { clear as clearWishlist } from "@/features/wishlist/model/wishlist.slice";
import { useToast } from "@/shared/context/ToastContext";

function SignOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function SignOutButton() {
  const { clearSession } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await logoutApi();
    } finally {
      // Reset cả cart cache và wishlist đồng bộ TRƯỚC clearSession
      dispatch(cartApi.util.resetApiState());
      dispatch(clearWishlist());
      clearSession();
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-store-border px-4 py-2 text-sm font-medium text-store-ink transition-all duration-150 hover:scale-[1.02] hover:border-store-ink-strong hover:bg-store-ink-strong hover:text-store-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-store-ink/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <SignOutIcon />
      {isSigningOut ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
