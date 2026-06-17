"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import { logout } from "@/admin/features/auth/authSlice";
import { getCurrentUser } from "@/admin/services/auth/authService";
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
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard", href: "/admin" },
  { icon: Package, label: "San pham", page: "products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Don hang", page: "orders", href: "/admin/orders" },
  { icon: Users, label: "Khach hang", page: "customers", href: "/admin/customers" },
  { icon: Tag, label: "Khuyen mai", page: "promotions", href: "/admin/promotions" },
  { icon: Settings, label: "Cai dat", page: "settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logout());
    window.location.assign("/account/login");
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Tai khoan";
  const displayEmail = user?.email || "Chua co email";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="admin-shell-enter flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <PanelLeft size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-slate-950">
            AdminShop
          </p>
          <p className="text-xs text-slate-500">Trung tam dieu khien</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item, index) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.page}
              href={item.href}
              className={`admin-nav-item group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
                }`}
              >
                <item.icon size={17} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight
                size={15}
                className={`transition-transform ${
                  active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
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
              title="Dang xuat"
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
