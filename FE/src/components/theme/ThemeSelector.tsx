"use client";

import { useTheme } from "./ThemeProvider";
import { iconBlockClassName, iconGlyphClassName } from "@/lib/icon-block";
import type { ThemeMode } from "@/lib/theme";

type ThemeOption = {
  value: ThemeMode;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
};

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      {...props}
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSystem(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      {...props}
    >
      <rect x="2" y="4" width="14" height="11" rx="1.5" />
      <path d="M6 18h6" strokeLinecap="round" />
      <rect x="17" y="6" width="5" height="10" rx="1" />
    </svg>
  );
}

const options: ThemeOption[] = [
  { value: "light", label: "Light", Icon: IconSun },
  { value: "dark", label: "Dark", Icon: IconMoon },
  { value: "system", label: "System", Icon: IconSystem },
];

export type ThemeSelectorProps = {
  className?: string;
};

export function ThemeSelector({ className = "" }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === theme),
  );

  return (
    <div
      className={`inline-flex ${className}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      <div className="relative inline-grid grid-cols-3 rounded-full border border-store-border/90 bg-store-surface p-1">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-store-paper shadow-sm transition-[left] duration-200 ease-out"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            left: `calc(0.25rem + ${activeIndex} * ((100% - 0.5rem) / 3))`,
          }}
        />
        {options.map((opt) => {
          const selected = theme === opt.value;
          const { Icon } = opt;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt.label}
              title={opt.label}
              onClick={() => setTheme(opt.value)}
              className={`relative z-10 ${iconBlockClassName} rounded-full text-store-ink transition-colors hover:text-store-ink-strong`}
            >
              <Icon className={iconGlyphClassName} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
