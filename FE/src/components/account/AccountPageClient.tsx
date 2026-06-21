"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AccountOrdersSectionWithParams } from "@/components/account/AccountOrdersSection";
import { SignOutButton } from "@/components/account/SignOutButton";
import { useAuth } from "@/features/auth";
import { useHasHydrated } from "@/shared/hooks";
import type { AuthUser } from "@/features/auth/model/auth.types";

type MockUser = {
  name: string;
  xp: number;
  xpGoal: number;
  tier: number;
};

type QuickLink = {
  title: string;
  description: string | null;
  appIcon: boolean;
};

type SidebarNavItem = {
  label: string;
  href: string;
};

const mockUser: MockUser = {
  name: "DŨNG NGUYỄN",
  xp: 25,
  xpGoal: 1250,
  tier: 1,
};

const tierBenefits: string[] = [
  "15% Birthday reward",
  "Anniversary reward",
  "Exclusive offers",
];

const quickLinks: QuickLink[] = [
  {
    title: "ADDRESS BOOK",
    description: null,
    appIcon: false,
  },
  {
    title: "RETURNS",
    description: "Quick, easy and simple returns with Loop Returns.",
    appIcon: false,
  },
  {
    title: "REFER A FRIEND",
    description:
      "Introduce your friends and give them $10 off, and to say thanks we'll give you $10 off your next order too.",
    appIcon: false,
  },
  {
    title: "THE GYMSHARK APP",
    description:
      "Shop your faves, get exclusive drops, class bookings and more.",
    appIcon: true,
  },
  {
    title: "THE TRAINING APP",
    description: "Choose your path, and train your way for free.",
    appIcon: true,
  },
];

const sidebarNav: SidebarNavItem[] = [
  { label: "REWARDS", href: "/account/rewards" },
  { label: "POINTS HISTORY", href: "/account/points-history" },
  { label: "LOYALTY OVERVIEW", href: "/account/loyalty" },
];

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-zinc-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-5 w-5 text-zinc-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function AppIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500">
      <svg
        className="h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    </div>
  );
}

function formatAccountDisplayName(user: AuthUser | null): string {
  if (!user) return "";

  const fromName = user.name?.trim();
  if (fromName) return fromName;

  const fromEmail = user.email?.split("@")[0]?.trim();
  return fromEmail ?? "";
}

export function AccountPageClient() {
  const mounted = useHasHydrated();
  const { user, sessionChecked } = useAuth();
  const { xp, xpGoal, tier } = mockUser;

  const name = formatAccountDisplayName(mounted ? user : null).toUpperCase();
  const showNameSkeleton = !mounted || (!name && !sessionChecked);
  const xpToGo = xpGoal - xp;
  const xpPercent = Math.min((xp / xpGoal) * 100, 100);

  return (
    <div className="-mx-4 -mt-9 sm:-mx-6 lg:-mx-8">
      <section
        className="px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #dbdbdb, #dadbdb)",
          minHeight: "560px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-10 py-14 lg:grid-cols-[280px_1fr_320px] lg:items-center">
          <div>
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900">
              {showNameSkeleton ? (
                <span
                  className="inline-block h-9 w-56 animate-pulse rounded bg-zinc-300/70"
                  aria-label="Loading account"
                />
              ) : (
                name
              )}
            </h1>
            <nav className="flex flex-col gap-2">
              {sidebarNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-bold tracking-widest transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "#CECFD0",
                    color: "#424145",
                    padding: "16px 24px",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="flex items-start">
              <span className="text-[110px] font-extralight leading-none tabular-nums tracking-tight text-zinc-900">
                {xp}
              </span>
              <span className="mt-5 ml-2 text-sm font-bold tracking-widest text-zinc-900">
                XP
              </span>
            </div>

            <div className="mt-8 w-full max-w-sm">
              <div className="relative h-px bg-zinc-300">
                <div
                  className="absolute inset-y-0 left-0 bg-zinc-800"
                  style={{ width: `${xpPercent}%` }}
                />
                <div
                  className="absolute top-1/2 h-2.5 w-2.5 rounded-full border-2 border-zinc-100 bg-zinc-800"
                  style={{
                    left: `${xpPercent}%`,
                    transform: "translateX(-50%) translateY(-50%)",
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs tracking-wide text-zinc-500">
                <span>
                  {xp}/{xpGoal}XP
                </span>
                <span>{xpToGo}XP TO GO</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Tier {tier} Benefits
            </p>
            <ul className="flex flex-col gap-2">
              {tierBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-xs font-bold tracking-widest"
                  style={{
                    backgroundColor: "#CECFD0",
                    color: "#424145",
                    padding: "17.5px 17px",
                  }}
                >
                  <span className="font-semibold text-zinc-400">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center">
              <ChevronDown />
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-8 grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="min-h-0">
            <Suspense
              fallback={
                <section
                  style={{ backgroundColor: "#F5F5F5", padding: "32px" }}
                  className="min-h-[320px]"
                >
                  <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
                    Orders
                  </h2>
                  <p className="py-8 text-center text-sm text-zinc-500">
                    Loading orders...
                  </p>
                </section>
              }
            >
              <AccountOrdersSectionWithParams />
            </Suspense>
          </div>

          <div className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <div
                key={link.title}
                className="flex min-h-[123px] items-center justify-between gap-4 bg-zinc-100 p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {link.appIcon && <AppIcon />}
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-900">
                      {link.title}
                    </p>
                    {link.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-zinc-500">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1600px] border-t border-zinc-200 pb-10 pt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
