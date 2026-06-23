import type { Metadata } from "next";
import AdminScrollLock from "./AdminScrollLock";
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
<<<<<<< HEAD
    <div className="admin-dashboard fixed inset-0 z-50 overflow-hidden bg-slate-50 text-slate-950">
      <AdminScrollLock />
      <ReduxProvider>{children}</ReduxProvider>
=======
    <div className="admin-dashboard fixed inset-0 z-50 overflow-auto bg-slate-50 text-slate-950">
      <ReduxProvider>
        <AdminDashboard>{children}</AdminDashboard>
      </ReduxProvider>
>>>>>>> features/task-01
    </div>
  );
}
