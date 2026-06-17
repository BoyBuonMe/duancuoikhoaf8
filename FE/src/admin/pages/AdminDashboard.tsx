"use client";

import React from "react";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./admin/AdminSidebar/AdminSidebar";
import type { AdminPage } from "./admin/AdminSidebar/AdminSidebar";

const pageTitles: Record<AdminPage, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Tổng quan vận hành cửa hàng",
  },
  products: {
    title: "Sản phẩm",
    subtitle: "Quản lý danh mục sản phẩm",
  },
  orders: {
    title: "Đơn hàng",
    subtitle: "Theo dõi và xử lý đơn hàng",
  },
  customers: {
    title: "Khách hàng",
    subtitle: "Quản lý tài khoản khách hàng",
  },
  promotions: {
    title: "Khuyến mãi",
    subtitle: "Quản lý voucher và mã giảm giá",
  },
  settings: {
    title: "Cài đặt",
    subtitle: "Cấu hình hệ thống",
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
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
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

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div key={page} className="h-full animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
