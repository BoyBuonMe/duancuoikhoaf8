import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/** Runs before paint to avoid theme flash on load. */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var mode = localStorage.getItem(key);
    var dark =
      mode === "dark" ||
      (mode !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.theme = mode === "light" || mode === "dark" || mode === "system" ? mode : "system";
    root.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
