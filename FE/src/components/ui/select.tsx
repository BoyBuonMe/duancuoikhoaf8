"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({
  id,
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SelectProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const showPlaceholder = !selected?.label;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-store-border bg-store-paper px-3 text-left text-sm outline-none transition-colors focus:border-store-ink-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            className={cn(
              "truncate pr-2",
              showPlaceholder
                ? "text-store-fg-muted"
                : "font-medium text-store-ink-strong",
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-store-fg-muted transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {open && !disabled ? (
          <ul
            role="listbox"
            className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-store-border bg-store-paper py-1 shadow-lg"
          >
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-store-surface",
                    opt.value === value
                      ? "font-bold text-store-ink-strong"
                      : "text-store-fg-muted",
                    opt.disabled &&
                      "cursor-not-allowed opacity-60 hover:bg-transparent",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
