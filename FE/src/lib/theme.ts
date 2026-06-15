export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "store-theme";

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeToDocument(mode: ThemeMode): void {
  const isDark = resolveIsDark(mode);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.dataset.theme = mode;
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* ignore */
  }
  return "system";
}
