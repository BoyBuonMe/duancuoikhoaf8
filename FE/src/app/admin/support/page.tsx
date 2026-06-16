import type { Metadata } from "next";
import { AdminSupportInboxPage } from "@/components/admin/AdminSupportInbox";

export const metadata: Metadata = {
  title: "Support Inbox | Admin",
};

export default function AdminSupportPage() {
  return <AdminSupportInboxPage />;
}
