"use client";

import React from "react";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./admin/AdminSidebar/AdminSidebar";
import type { AdminPage } from "./admin/AdminSidebar/AdminSidebar";

const pageTitles: Record<AdminPage, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Tong quan van hanh cua hang",
  },
  products: {
    title: "San pham",
    subtitle: "Quan ly danh muc san pham",
  },
  orders: {
    title: "Don hang",
    subtitle: "Theo doi va xu ly don hang",
  },
  customers: {
    title: "Khach hang",
    subtitle: "Quan ly tai khoan khach hang",
  },
  promotions: {
    title: "Khuyen mai",
    subtitle: "Quan ly voucher va ma giam gia",
  },
  settings: {
    title: "Cai dat",
    subtitle: "Cau hinh he thong",
  },
};

function pageFromPathname(pathname: string): AdminPage {
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/customers")) return "customers";
  if (pathname.startsWith("/admin/promotions")) return "promotions";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}

export default function AdminDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const page = pageFromPathname(pathname);
  const { title, subtitle } = pageTitles[page];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          </div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600">
            <Bell size={17} />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div key={page} className="h-full animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
