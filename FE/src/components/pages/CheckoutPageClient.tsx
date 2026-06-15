"use client";

import { useSearchParams } from "next/navigation";
import { CheckoutView } from "@/components/pages/CheckoutView";

export function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;

  return <CheckoutView slug={slug} />;
}
