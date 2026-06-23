"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import { logout } from "@/admin/features/auth/authSlice";
import { getCurrentUser } from "@/admin/services/auth/authService";
import { logoutApi } from "@/features/auth/api/auth.api";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminPage =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "promotions"
  | "settings";

type NavItem = {
  icon: LucideIcon;
  label: string;
  page: AdminPage;
  href: string;
};

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    page: "dashboard",
    href: "/admin",
  },
  {
    icon: Package,
    label: "Sản phẩm",
    page: "products",
    href: "/admin/products",
  },
  {
    icon: ShoppingCart,
    label: "Đơn hàng",
    page: "orders",
    href: "/admin/orders",
  },
  {
    icon: Users,
    label: "Khách hàng",
    page: "customers",
    href: "/admin/customers",
  },
  {
    icon: Tag,
    label: "Khuyến mãi",
    page: "promotions",
    href: "/admin/promotions",
  },
  {
    icon: Settings,
    label: "Cài đặt",
    page: "settings",
    href: "/admin/settings",
  },
];

export default function AdminSidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      dispatch(logout());
      window.location.assign("/account/login");
    }
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Tài khoản";
  const displayEmail = user?.email || "Chưa có email";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="admin-shell-enter flex w-full shrink-0 flex-col border-b border-slate-200 bg-white text-slate-700 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:self-start lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 lg:px-5 lg:py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <PanelLeft size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-slate-950">
            GymTier Admin
          </p>
          <p className="text-xs text-slate-500">Trung tâm điều khiển</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:block lg:flex-1 lg:space-y-3 lg:overflow-visible lg:px-3 lg:py-6">
        {navItems.map((item, index) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.page}
              href={item.href}
              className={`admin-nav-item group flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all duration-200 lg:h-[52px] lg:w-full lg:gap-3 ${
                active
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors lg:h-9 lg:w-9 ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
                }`}
              >
                <item.icon size={17} />
              </span>
              <span className="whitespace-nowrap text-left lg:flex-1">{item.label}</span>
              <ChevronRight
                size={15}
                className={`hidden transition-transform lg:block ${
                  active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-slate-200 p-3 lg:block">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">{displayEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
