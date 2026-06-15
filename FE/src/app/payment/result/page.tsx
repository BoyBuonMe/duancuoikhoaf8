import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResultClient } from "@/components/pages/PaymentResultClient";

export const metadata: Metadata = {
  title: "Payment Result | Gymshark",
};

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-store-fg-muted">Loading...</p>
        </div>
      }
    >
      <PaymentResultClient />
    </Suspense>
  );
}
