"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { MegaMenuPanel } from "./MegaMenuPanel";
import {
  IconClose,
  IconHeart,
  IconMenu,
  IconPause,
  IconPlay,
  IconSearch,
  IconUser,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { iconBlockClassName, iconGlyphClassName } from "@/lib/icon-block";
import { CartDrawer } from "./CartDrawer";
import { HeaderSearch } from "./HeaderSearch";
import { DEFAULT_NAV } from "@/lib/default-nav";
import type { NavItem, NavSubItem } from "@/types/nav";
import { useAuth } from "@/features/auth";
import { useWishlist } from "@/features/wishlist";

// Re-export for backward compat if used elsewhere
export type SiteHeaderNavSubItem = NavSubItem;
export type SiteHeaderNavItem = NavItem;

export type SiteHeaderProps = {
  brandName?: string;
  logoHref?: string;
  logo?: React.ReactNode;
  navItems?: SiteHeaderNavItem[];
  activeHref?: string;
  announcement?: string;
  announcements?: string[];
  searchPlaceholder?: string;
  className?: string;
  onSearchSubmit?: (query: string) => void;
};

export function SiteHeader({
  brandName = "GYMSHARK",
  logoHref = "/",
  logo,
  navItems = DEFAULT_NAV,
  activeHref,
  announcement = "Get 10% off when you sign up for emails",
  announcements,
  searchPlaceholder = "What are you looking for tod…",
  className = "",
  onSearchSubmit,
}: SiteHeaderProps) {
  const { isAuthenticated } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const activeNavTriggerRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<SiteHeaderNavItem | null>(null);
  const lines = announcements?.length
    ? announcements
    : [
        announcement,
        "Students get 15% off",
        "Free standard shipping on orders over $100",
      ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* ── update --header-h so the fixed panel can sit right below the header ── */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`,
      );
    });
    obs.observe(el);
    document.documentElement.style.setProperty(
      "--header-h",
      `${el.offsetHeight}px`,
    );
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (lines.length <= 1 || paused) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % lines.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, [lines.length, paused]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!activeNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveNav(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeNav]);

  const openDropdown = (item: SiteHeaderNavItem) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveNav(item);
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setActiveNav(null), 150);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const closeMenu = () => {
    cancelClose();
    setActiveNav(null);
  };

  const handleNavMouseLeave = (
    item: SiteHeaderNavItem,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const related = e.relatedTarget;
    if (related instanceof Node && megaMenuRef.current?.contains(related)) {
      return;
    }
    scheduleClose();
  };

  const line = lines[index] ?? announcement;
  const nextLine = lines[(index + 1) % lines.length] ?? line;

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 w-full bg-store-paper text-store-ink-strong",
          className,
        )}
      >
        {/* Announcement */}
        <div className="border-b border-store-border/80 bg-store-surface">
          <div className="grid h-14 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-10">
            <div aria-hidden="true" />
            <div className="flex h-full min-w-0 items-center justify-center overflow-hidden text-center">
              <div
                key={index}
                className="animate-announcement-slide-up flex h-full min-w-0 flex-col"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                <Link
                  href="/refer"
                  className="flex h-full min-w-0 shrink-0 items-center justify-center whitespace-nowrap text-[11px] underline underline-offset-4 hover:no-underline sm:text-xs"
                >
                  {line}
                </Link>
                <Link
                  href="/refer"
                  className="flex h-full min-w-0 shrink-0 items-center justify-center whitespace-nowrap text-[11px] underline underline-offset-4 hover:no-underline sm:text-xs"
                >
                  {nextLine}
                </Link>
              </div>
            </div>
            {lines.length > 1 && (
              <button
                type="button"
                className="justify-self-end p-1 text-store-fg-muted hover:text-store-ink-strong"
                onClick={() => setPaused((p) => !p)}
                aria-label={
                  paused ? "Play announcements" : "Pause announcements"
                }
              >
                {paused ? (
                  <IconPlay className="size-4" />
                ) : (
                  <IconPause className="size-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Main bar */}
        <div className="border-b border-store-border/80">
          <div className="grid h-24 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-6 lg:h-auto lg:gap-6 lg:px-10 lg:py-3">
            {/* Left: hamburger (mobile) + desktop nav */}
            <div className="flex min-w-0 items-center gap-5 lg:min-w-50 lg:gap-2">
              <button
                type="button"
                className={cn(
                  iconBlockClassName,
                  "rounded-md hover:bg-store-surface lg:hidden",
                )}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <IconMenu className={iconGlyphClassName} />
              </button>

              <button
                type="button"
                className={cn(
                  iconBlockClassName,
                  "rounded-full hover:bg-store-surface lg:hidden",
                )}
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
              >
                <IconSearch
                  className={cn(iconGlyphClassName, "text-store-ink")}
                />
              </button>

              {/* Desktop nav */}
              <nav
                className="hidden min-w-0 lg:flex lg:items-center lg:gap-6"
                aria-label="Main"
              >
                {navItems.map((item) =>
                  item.subItems?.length ? (
                    <div
                      key={item.href}
                      ref={
                        activeNav?.href === item.href
                          ? activeNavTriggerRef
                          : undefined
                      }
                      onMouseEnter={() => openDropdown(item)}
                      onMouseLeave={(e) => handleNavMouseLeave(item, e)}
                    >
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={activeNav?.href === item.href}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (activeNav?.href === item.href) {
                              setActiveNav(null);
                            } else {
                              setActiveNav(item);
                            }
                          }
                        }}
                        className={cn(
                          "relative shrink-0 text-sm font-medium tracking-wide text-store-ink-strong",
                          "cursor-pointer bg-transparent",
                          "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full",
                          "after:bg-store-ink-strong after:transition-opacity",
                          activeNav?.href === item.href
                            ? "after:opacity-100"
                            : "after:opacity-0 hover:after:opacity-100",
                        )}
                      >
                        {item.label}
                      </button>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative shrink-0 text-sm font-medium tracking-wide text-store-ink-strong",
                        "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full",
                        "after:bg-store-ink-strong after:opacity-0 after:transition-opacity",
                        "hover:after:opacity-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            </div>

            {/* Logo */}
            <div className="flex min-w-0 justify-center">
              <Link
                href={logoHref}
                className="font-sans text-2xl font-black uppercase leading-none tracking-[-0.04em] sm:text-2xl"
                style={{ fontStretch: "condensed" }}
              >
                {logo ?? brandName}
              </Link>
            </div>

            {/* Right: search + icons */}
            <div className="flex min-w-0 shrink-0 items-center justify-end gap-5 lg:gap-3">
              <div className="hidden min-w-0 max-w-md flex-1 lg:block lg:max-w-[320px] lg:flex-none xl:max-w-95">
                <HeaderSearch placeholder={searchPlaceholder} />
              </div>

              <Link
                href="/wishlist"
                className={cn(
                  iconBlockClassName,
                  "relative hidden rounded-full hover:bg-store-surface lg:inline-flex",
                )}
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              >
                <IconHeart className="size-5" />
                {wishlistCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-store-accent text-[10px] font-semibold leading-none text-store-on-accent">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/account/login"}
                className={cn(
                  iconBlockClassName,
                  "rounded-full hover:bg-store-surface",
                )}
                aria-label="Account"
              >
                <IconUser className="size-5" />
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>

        {/* Mobile search overlay */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-store-ink/40 lg:hidden"
            role="presentation"
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="border-b border-store-border bg-store-paper p-4 shadow-md"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2">
                <HeaderSearch
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1"
                  inputClassName="h-11 border border-store-border bg-store-surface-2 focus:border-store-border-strong focus:ring-store-ink/10"
                  autoFocus
                  onClose={() => setSearchOpen(false)}
                  showSubmitButton
                />
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-store-border px-3 text-sm hover:bg-store-surface"
                  onClick={() => setSearchOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-store-ink/40"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <div
              id={menuId}
              className="absolute left-0 top-0 flex h-full w-[min(100%,320px)] flex-col bg-store-paper shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
            >
              <div className="flex items-center justify-between border-b border-store-border px-4 py-3">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Menu
                </span>
                <button
                  type="button"
                  className={cn(
                    iconBlockClassName,
                    "rounded-md hover:bg-store-surface",
                  )}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <IconClose className={iconGlyphClassName} />
                </button>
              </div>
              <nav className="flex flex-col p-2" aria-label="Mobile">
                {navItems.map((item) => {
                  const active = activeHref === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "rounded-lg px-4 py-3 text-base font-medium",
                        active
                          ? "bg-store-surface"
                          : "hover:bg-store-surface-2",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Mega menu panel — fixed at left viewport edge, just below the header */}
      {activeNav?.subItems && (
        <MegaMenuPanel
          item={activeNav}
          panelRef={megaMenuRef}
          navTriggerRef={activeNavTriggerRef}
          onKeepOpen={cancelClose}
          onRequestClose={closeMenu}
          onNavigate={closeMenu}
        />
      )}

      {/* Backdrop — dimmed area outside the panel; hover or click closes menu */}
      {activeNav && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-[35] hidden bg-black/25 lg:block"
          style={{ top: "var(--header-h, 64px)" }}
          aria-hidden
          onMouseEnter={closeMenu}
          onClick={closeMenu}
        />
      )}
    </>
  );
}
