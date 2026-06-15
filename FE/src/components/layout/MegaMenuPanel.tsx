"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, NavSubItem } from "@/types/nav";

export interface MegaMenuPanelProps {
  item: NavItem;
  style?: React.CSSProperties;
  /** Called on mouseEnter — parent should cancel any scheduled close */
  onKeepOpen: () => void;
  /** Called on mouseLeave — parent should schedule close */
  onRequestClose: () => void;
  /** Called when user clicks a nav link */
  onNavigate: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  /** When leaving the panel toward the active nav trigger, do not request close */
  navTriggerRef?: React.RefObject<HTMLElement | null>;
}

export function MegaMenuPanel({
  item,
  style,
  onKeepOpen,
  onRequestClose,
  onNavigate,
  panelRef,
  navTriggerRef,
}: MegaMenuPanelProps) {
  const [activeSub, setActiveSub] = useState<NavSubItem | null>(null);
  const subTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSub = (sub: NavSubItem) => {
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current);
    setActiveSub(sub);
  };

  const scheduleSub = () => {
    subTimeoutRef.current = setTimeout(() => setActiveSub(null), 120);
  };

  const cancelSub = () => {
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current);
  };

  const hasRightPanel = !!activeSub?.children?.length;

  return (
    <div
      ref={panelRef}
      className="fixed left-0 z-50 hidden lg:flex"
      style={{
        top: "var(--header-h, 64px)",
        height: "calc(100vh - var(--header-h, 64px))",
        ...style,
      }}
      onMouseEnter={onKeepOpen}
      onMouseLeave={(e) => {
        const related = e.relatedTarget;
        if (
          related instanceof Node &&
          navTriggerRef?.current?.contains(related)
        ) {
          return;
        }
        onRequestClose();
      }}
    >
      {/* Left column — level-2 categories */}
      <div className="h-full w-[260px] overflow-y-auto border-r border-store-border bg-store-paper py-3 text-store-ink shadow-2xl">
        {item.subItems?.map((sub) => (
          <div
            key={sub.href}
            onMouseEnter={() => openSub(sub)}
            onMouseLeave={scheduleSub}
          >
            <span
              className={cn(
                "flex items-center justify-between gap-3 px-6 py-4",
                "text-xs font-bold uppercase tracking-widest text-store-ink-strong",
                "transition-colors select-none",
                activeSub?.href === sub.href
                  ? "bg-store-surface text-store-ink-strong"
                  : "hover:bg-store-surface hover:text-store-fg-muted",
              )}
            >
              {sub.label}
              <ChevronRightIcon className="size-4 shrink-0 opacity-40" />
            </span>
          </div>
        ))}
      </div>

      {/* Right column — level-3 sub-categories of the hovered level-2 item */}
      {hasRightPanel && (
        <div
          className="h-full w-[260px] overflow-y-auto border-l border-store-border bg-store-paper py-3 text-store-ink shadow-2xl"
          onMouseEnter={cancelSub}
          onMouseLeave={scheduleSub}
        >
          {activeSub?.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="flex items-center justify-between gap-3 px-6 py-4 text-xs font-bold uppercase tracking-widest text-store-ink-strong transition-colors hover:bg-store-surface hover:text-store-fg-muted"
            >
              {child.label}
              <ChevronRightIcon className="size-4 shrink-0 opacity-30" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
