import type { Metadata } from "next";
import { AccountPageClient } from "@/components/account/AccountPageClient";

export const metadata: Metadata = {
  title: "My Account | Gymshark",
};

export default function AccountPage() {
  return <AccountPageClient />;
}
