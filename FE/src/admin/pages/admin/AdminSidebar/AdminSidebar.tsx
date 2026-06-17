"use client";

import { useEffect } from "react";
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
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: Package, label: "Sản phẩm", page: "products" },
  { icon: ShoppingCart, label: "Đơn hàng", page: "orders" },
  { icon: Users, label: "Khách hàng", page: "customers" },
  { icon: Tag, label: "Khuyến mãi", page: "promotions" },
  { icon: Settings, label: "Cài đặt", page: "settings" },
];

type Props = {
  activePage: AdminPage;
  onPageChange: (page: AdminPage) => void;
};

export default function AdminSidebar({
  activePage,
  onPageChange,
}: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logout());
    window.location.assign("/account/login");
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Tài khoản";
  const displayEmail = user?.email || "Chưa có email";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="admin-shell-enter flex w-72 shrink-0 flex-col bg-slate-950 text-slate-200 shadow-2xl">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg shadow-indigo-500/20">
          <PanelLeft size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-white">
            AdminShop
          </p>
          <p className="text-xs text-slate-400">Trung tâm điều khiển</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item, index) => (
          <button
            key={item.page}
            onClick={() => onPageChange(item.page)}
            className={`admin-nav-item group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activePage === item.page
                ? "bg-white text-slate-950 shadow-lg shadow-black/20"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                activePage === item.page
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
              }`}
            >
              <item.icon size={18} />
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight
              size={16}
              className={`transition-transform ${
                activePage === item.page
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
              }`}
            />
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-400">{displayEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
