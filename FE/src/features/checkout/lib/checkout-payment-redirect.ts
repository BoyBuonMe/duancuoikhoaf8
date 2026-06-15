const CHECKOUT_RETURN_RELOAD_KEY = "checkout-return-reload";

export function markCheckoutPaymentRedirect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_RETURN_RELOAD_KEY, "1");
}

export function consumeCheckoutReturnReload(): boolean {
  if (typeof window === "undefined") return false;
  const shouldReload = sessionStorage.getItem(CHECKOUT_RETURN_RELOAD_KEY) === "1";
  if (shouldReload) {
    sessionStorage.removeItem(CHECKOUT_RETURN_RELOAD_KEY);
  }
  return shouldReload;
}
