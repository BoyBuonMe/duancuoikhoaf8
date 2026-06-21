"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applyThemeToDocument,
  readStoredTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_CHANGE_EVENT = "store-theme-change";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

function getServerThemeSnapshot(): ThemeMode {
  return "system";
}

function getStoredThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return getServerThemeSnapshot();
  return readStoredTheme();
}

function subscribeStoredTheme(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
  };
}

function getServerSystemDarkSnapshot(): boolean {
  return false;
}

function getSystemDarkSnapshot(): boolean {
  if (typeof window === "undefined") return getServerSystemDarkSnapshot();
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

function subscribeSystemDark(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia(SYSTEM_DARK_QUERY);
  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeStoredTheme,
    getStoredThemeSnapshot,
    getServerThemeSnapshot,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getServerSystemDarkSnapshot,
  );

  const setTheme = useCallback((mode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    } catch {
      /* ignore */
    }
    applyThemeToDocument(mode);
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, systemDark]);

  const resolvedDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return systemDark;
  }, [theme, systemDark]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedDark }),
    [theme, setTheme, resolvedDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
