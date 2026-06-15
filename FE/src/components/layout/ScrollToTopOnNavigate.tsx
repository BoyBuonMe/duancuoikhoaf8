"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Always start at the top when navigating to any route (including browser back). */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
