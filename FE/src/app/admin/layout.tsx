import type { Metadata } from "next";
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
    <div className="admin-dashboard fixed inset-0 z-50 overflow-auto bg-slate-50 text-slate-950">
      <ReduxProvider>{children}</ReduxProvider>
    </div>
  );
}
