"use client";

import { ArrowLeft } from "lucide-react";
import type {
  AdminUser,
  UserRole,
  UserStatus,
} from "@/admin/services/admin/adminUsersService";

type Props = {
  user: AdminUser;
  onBack: () => void;
  onEdit: (user: AdminUser) => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  boss: "Boss",
  admin: "Admin",
  user: "Người dùng",
};

const ROLE_COLORS: Record<UserRole, string> = {
  boss: "bg-yellow-100 text-yellow-700",
  admin: "bg-purple-100 text-purple-700",
  user: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Hoat dong",
  blocked: "Bi khoa",
};

const STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function ViewUserPage({ user, onBack, onEdit }: Props) {
  return (
    <div className="space-y-5 animate-page-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 animate-slide-left"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Chi tiết người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thông tin chi tiết của tài khoản người dùng.
          </p>
        </div>
        <button
          onClick={() => onEdit(user)}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Chỉnh sửa
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl p-6 space-y-6 animate-card-in delay-150">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shrink-0">
            {user.name.split(" ").pop()?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}
              >
                {STATUS_LABELS[user.status]}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Số điện thoại
            </p>
            <p className="font-medium text-gray-800">{user.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Ngày tham gia
            </p>
            <p className="font-medium text-gray-800">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Cập nhật lần cuối
            </p>
            <p className="font-medium text-gray-800">
              {formatDate(user.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Mã người dùng
            </p>
            <p className="font-mono text-xs text-gray-400 break-all">
              {user._id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
