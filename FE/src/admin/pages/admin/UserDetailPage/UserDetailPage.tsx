"use client";

import { ArrowLeft, BadgeCheck, Mail, Shield, UserRound } from "lucide-react";
import type {
  AdminUser,
  UserRole,
  UserStatus,
} from "@/admin/services/admin/adminUsersService";

const ROLE_LABELS: Record<UserRole, string> = {
  boss: "Boss",
  admin: "Admin",
  user: "User",
};

const ROLE_COLORS: Record<UserRole, string> = {
  boss: "bg-red-50 text-red-700 ring-red-100",
  admin: "bg-purple-50 text-purple-700 ring-purple-100",
  user: "bg-slate-100 text-slate-700 ring-slate-200",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Hoạt động",
  blocked: "Bị khóa",
};

const STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

type Props = {
  user: AdminUser;
  onBack: () => void;
};

export default function UserDetailPage({ user, onBack }: Props) {
  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Chi tiết người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin đầy đủ của tài khoản.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="dashboard-card p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-2xl font-bold text-violet-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            {user.name}
          </h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge className={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
            <Badge className={STATUS_COLORS[user.status]}>
              {STATUS_LABELS[user.status]}
            </Badge>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Info label="Email" value={user.email} icon={Mail} />
            <Info label="Phone" value={user.phone || "-"} icon={UserRound} />
            <Info
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
              icon={BadgeCheck}
            />
            <Info label="Mã user" value={user._id} icon={Shield} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <p className="break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
