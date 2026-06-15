import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/components/pages/OrdersView";

export const metadata: Metadata = {
  title: "Orders | Gymshark",
};

export default function AccountOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="-mx-4 -mt-9 bg-[#F5F5F5] px-4 py-16 text-center text-sm text-zinc-500 sm:-mx-6 lg:-mx-8">
          Loading orders...
        </div>
      }
    >
      <OrdersView />
    </Suspense>
  );
}
