"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import AdminSidebar from "./admin/AdminSidebar/AdminSidebar";
import type { AdminPage } from "./admin/AdminSidebar/AdminSidebar";
import DashboardOverview from "./admin/DashboardOverview/DashboardOverview";
import OrdersPage from "./admin/OrdersPage/OrdersPage";
import ProductsPage from "./admin/ProductsPage/ProductsPage";
import UsersPage from "./admin/UsersPage/UsersPage";
import VouchersPage from "./admin/VouchersPage/VouchersPage";

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

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const { title, subtitle } = pageTitles[activePage];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage={activePage} onPageChange={setActivePage} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 shadow-sm transition hover:text-gray-700">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              3
            </span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div key={activePage} className="h-full animate-page-in">
            {activePage === "dashboard" && <DashboardOverview />}
            {activePage === "products" && <ProductsPage />}
            {activePage === "orders" && <OrdersPage />}
            {activePage === "customers" && <UsersPage />}
            {activePage === "promotions" && <VouchersPage />}
            {activePage === "settings" && (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
                <p className="text-base font-medium">
                  Tính năng đang phát triển
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
