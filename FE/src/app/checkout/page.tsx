import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/pages/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout | Gymshark",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-base font-bold uppercase tracking-wider text-store-ink-strong">
            Loading checkout...
          </p>
        </div>
      }
    >
      <CheckoutPageClient />
    </Suspense>
  );
}
