import type { Metadata } from "next";
import AdminScrollLock from "./AdminScrollLock";
import ReduxProvider from "@/admin/ReduxProvider";

export const metadata: Metadata = {
  title: "AdminShop",
  description: "E-commerce admin dashboard",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-dashboard fixed inset-0 z-50 overflow-hidden bg-slate-50 text-slate-950">
      <AdminScrollLock />
      <ReduxProvider>{children}</ReduxProvider>
    </div>
  );
}
