import { isAxiosError } from "axios";

export const authInputClassName =
  "w-full rounded border border-store-border bg-store-paper px-4 py-3 text-sm text-store-ink placeholder:text-store-fg-subtle outline-none transition-colors focus:border-store-ink-strong";

export const authSubmitButtonClassName =
  "mt-2 w-full rounded-full bg-store-ink-strong py-3.5 text-sm font-bold tracking-[0.14em] text-store-paper uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export function getAuthFormErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
}

export function getAuthFormErrorCode(error: unknown): string | null {
  if (isAxiosError(error)) {
    const code = error.response?.data?.code;
    if (typeof code === "string") return code;
  }
  return null;
}
