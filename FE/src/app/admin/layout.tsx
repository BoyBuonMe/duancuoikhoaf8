import type { Metadata } from "next";
import ReduxProvider from "@/admin/ReduxProvider";
import AdminDashboard from "@/admin/pages/AdminDashboard";

export const metadata: Metadata = {
  title: "GymTier Admin",
  description: "E-commerce admin dashboard",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-dashboard fixed inset-0 z-50 overflow-auto bg-slate-50 text-slate-950">
      <ReduxProvider>
        <AdminDashboard>{children}</AdminDashboard>
      </ReduxProvider>
    </div>
  );
}
