import type { SVGProps } from "react";

const strokeIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  "aria-hidden": true,
} as const;

function StoreStrokeIcon({
  children,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg {...strokeIconProps} {...props}>
      {children}
    </svg>
  );
}

export function IconBag(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path d="M9 11V8a3 3 0 0 1 6 0v3" strokeLinecap="round" />
      <path d="M5 11h14l-1 10H6L5 11Z" strokeLinejoin="round" />
    </StoreStrokeIcon>
  );
}

export function IconHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path
        d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 7-3 4.5 4.5 0 0 1 7 3c0 5.65-7 10-7 10Z"
        strokeLinejoin="round"
      />
    </StoreStrokeIcon>
  );
}

export function IconOrder(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path d="M9 5h10l2 4H7l2-4Z" strokeLinejoin="round" />
      <path d="M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" strokeLinejoin="round" />
      <path d="M10 13h4" strokeLinecap="round" />
    </StoreStrokeIcon>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </StoreStrokeIcon>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </StoreStrokeIcon>
  );
}

export function IconUser(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
    </StoreStrokeIcon>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <StoreStrokeIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </StoreStrokeIcon>
  );
}

export function IconPause(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function IconPlay(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M8 5v14l11-7-11-7Z" />
    </svg>
  );
}
