"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";

export type AuthFloatingInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> & {
  label: string;
  endAdornment?: ReactNode;
  error?: string;
};

const labelBase =
  "pointer-events-none absolute left-4 origin-left transition-all duration-200 ease-out";

const labelResting = "top-1/2 -translate-y-1/2 text-sm text-store-fg-subtle";

/** Stacked floating label: label rests in the field, then slides up on focus or when filled. */
export function AuthFloatingInput({
  id,
  label,
  className,
  endAdornment,
  error,
  ...props
}: AuthFloatingInputProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <div className="relative">
        <input
          id={inputId}
          placeholder=" "
          className={cn(
            "peer w-full rounded border border-store-border bg-store-paper px-4 pt-6 pb-2.5 text-sm text-store-ink outline-none transition-[border-color,padding] duration-200 focus:border-store-ink-strong",
            error && "border-destructive focus:border-destructive",
            endAdornment && "pr-11",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            labelBase,
            labelResting,
            "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-store-ink",
            "peer-not-placeholder-shown:top-2.5 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-store-ink",
          )}
        >
          {label}
        </label>
        {endAdornment ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
