import Link from "next/link";
import { SignOutButton } from "@/components/account/SignOutButton";

/* ── types ── */
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

/* ── mock data (replace with real auth/API later) ── */
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

/* ── nav items ── */
type SidebarNavItem = {
  label: string;
  href: string;
};

const sidebarNav: SidebarNavItem[] = [
  { label: "REWARDS", href: "/account/rewards" },
  { label: "POINTS HISTORY", href: "/account/points-history" },
  { label: "LOYALTY OVERVIEW", href: "/account/loyalty" },
];

/* ── icons ── */
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="w-5 h-5 text-zinc-400 flex-shrink-0"
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
      className="w-5 h-5 text-zinc-400"
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
    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
      <svg
        className="w-5 h-5 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    </div>
  );
}

/* ── clothes illustration ── */
function ClothesIllustration() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="70" cy="70" r="58" fill="#e5e7eb" />
      {/* decorative dots */}
      <circle cx="34" cy="62" r="2.5" fill="#d1d5db" />
      <circle cx="34" cy="88" r="2" fill="#d1d5db" />
      <circle cx="104" cy="55" r="2.5" fill="#d1d5db" />
      <circle cx="108" cy="82" r="2" fill="#d1d5db" />
      {/* hanger rail */}
      <line
        x1="35"
        y1="50"
        x2="105"
        y2="50"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* hanger hooks */}
      <path
        d="M52 50 Q52 42 59 42 Q66 42 66 50"
        stroke="#9ca3af"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M74 50 Q74 42 81 42 Q88 42 88 50"
        stroke="#9ca3af"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* pants */}
      <rect x="43" y="50" width="9" height="14" rx="1" fill="#9ca3af" />
      <path d="M43 64 L43 84 L47.5 84 L47.5 64" fill="#9ca3af" />
      <path d="M52 64 L52 84 L47.5 84 L47.5 64" fill="#9ca3af" />
      {/* hoodie */}
      <path
        d="M66 50 L61 60 L70 60 L70 86 L82 86 L82 60 L91 60 L86 50 Z"
        fill="#9ca3af"
      />
      {/* t-shirt small */}
      <path
        d="M88 50 L84 58 L90 58 L90 76 L98 76 L98 58 L104 58 L100 50 Z"
        fill="#9ca3af"
      />
    </svg>
  );
}

/* ── page ── */
export default function AccountView() {
  const { name, xp, xpGoal, tier } = mockUser;
  const xpToGo = xpGoal - xp;
  const xpPercent = Math.min((xp / xpGoal) * 100, 100);

  return (
    /* Break out of the layout's px/py to allow full-width hero */
    <div className="-mt-9 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* ───────── Loyalty Hero ───────── */}
      <section
        className="px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #dbdbdb, #dadbdb)",
          minHeight: "560px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="mx-auto w-full max-w-[1600px] grid grid-cols-1 gap-10 py-14 lg:grid-cols-[280px_1fr_320px] lg:items-center">
          {/* Left: name + sidebar nav */}
          <div>
            <h1 className="mb-8 text-3xl font-bold tracking-tight">{name}</h1>
            <nav className="flex flex-col gap-2">
              {sidebarNav.map((item: SidebarNavItem) => (
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

          {/* Center: XP + progress */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="flex items-start">
              <span className="text-[110px] font-extralight leading-none tabular-nums tracking-tight">
                {xp}
              </span>
              <span className="mt-5 ml-2 text-sm font-bold tracking-widest">
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
                  className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-zinc-800 border-2 border-zinc-100"
                  style={{
                    left: `${xpPercent}%`,
                    transform: "translateX(-50%) translateY(-50%)",
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-zinc-500 tracking-wide">
                <span>
                  {xp}/{xpGoal}XP
                </span>
                <span>{xpToGo}XP TO GO</span>
              </div>
            </div>
          </div>

          {/* Right: tier benefits */}
          <div className="p-8">
            <p className="mb-6 text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase text-center">
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
                  <span className="text-zinc-400 font-semibold">✓</span>
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

      {/* ───────── Body ───────── */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* Orders — empty state */}
          <section
            className=""
            style={{ backgroundColor: "#F5F5F5", padding: "32px" }}
          >
            <h2 className="mb-8 text-xs font-bold tracking-[0.2em] uppercase text-zinc-900">
              Orders
            </h2>
            <div className="flex flex-col items-center text-center py-8">
              <ClothesIllustration />
              <p className="mt-6 text-sm text-zinc-500 max-w-[260px] leading-relaxed">
                You haven&apos;t made any orders yet. When you make an order
                it&apos;ll show it up here.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/women"
                  className="rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
                >
                  SHOP WOMENS
                </Link>
                <Link
                  href="/men"
                  className="rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
                >
                  SHOP MENS
                </Link>
              </div>
            </div>
          </section>

          {/* Quick-link cards */}
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

        {/* Sign Out */}
        <div className="mx-auto max-w-[1600px] mt-10 border-t border-zinc-200 pt-6 pb-10">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
