"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { isDashboardUser } from "@/features/auth/model/auth-redirect";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, sessionChecked, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!sessionChecked) return;
    if (!isAuthenticated) {
      router.replace("/account/login?next=/admin/support");
      return;
    }
    if (user && !isDashboardUser(user)) {
      router.replace("/account");
    }
  }, [isAuthenticated, router, sessionChecked, user]);

  if (!sessionChecked) {
    return (
      <div className="py-16 text-center text-sm text-zinc-500">
        Checking access...
      </div>
    );
  }

  if (!user || !isDashboardUser(user)) {
    return null;
  }

  return <>{children}</>;
}

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          Back to store
        </Link>
      </div>
      {children}
    </div>
  );
}
