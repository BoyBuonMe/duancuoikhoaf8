import { cn } from "@/lib/utils";

type GymsharkLogoProps = {
  className?: string;
};

/** Stylized shark mark for auth screens. */
export function GymsharkLogo({ className }: GymsharkLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      className={cn("h-11 w-11 text-store-ink-strong", className)}
      aria-hidden
    >
      <path d="M24 5c-5.8 0-11 3.2-13.6 8.3L6 18.5V22l3.2 1.6-1.6 6.4 4.8 3.2V36h16v-2.8l4.8-3.2-1.6-6.4L42 22v-3.5L37.6 13.3 35.6 8.3 32 5.8 28 5h-4zm0 4.2 2.8 1 2.2 3.8 1.4 5.2-1.2 4.6-2.4 2.4h-5.6l-2.4-2.4-1.2-4.6 1.4-5.2 2.2-3.8L24 9.2z" />
      <path d="M18 22.5 14 26l2 3 6-1.5V22.5zm12 0V27.5l6 1.5 2-3-4-3.5z" opacity="0.35" />
    </svg>
  );
}
