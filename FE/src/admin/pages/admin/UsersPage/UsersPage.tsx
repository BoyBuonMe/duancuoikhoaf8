"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import { getUsers } from "@/admin/features/admin/adminUsersSlice";
import { removeUser } from "@/admin/services/admin/adminUsersService";
import type {
  AdminUser,
  UserRole,
  UserStatus,
} from "@/admin/services/admin/adminUsersService";
import ViewUserPage from "../ViewUserPage/ViewUserPage";
import EditUserPage from "../EditUserPage/EditUserPage";
import DeleteUserModal from "../DeleteUserModal/DeleteUserModal";

type ViewMode = "list" | "view" | "edit" | "delete";

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

const PAGE_SIZE = 8;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.adminUsers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u._id.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goList() {
    setViewMode("list");
    setSelected(null);
  }
  function openView(u: AdminUser) {
    setSelected(u);
    setViewMode("view");
  }
  function openEdit(u: AdminUser) {
    setSelected(u);
    setViewMode("edit");
  }
  function openDelete(u: AdminUser) {
    setSelected(u);
    setViewMode("delete");
  }
  function closeDelete() {
    setViewMode("list");
    setSelected(null);
  }

  async function handleDelete() {
    if (!selected) return;
    setIsDeleting(true);
    await dispatch(removeUser(selected._id));
    dispatch(getUsers());
    setIsDeleting(false);
    closeDelete();
  }

  if (viewMode === "view" && selected) {
    return <ViewUserPage user={selected} onBack={goList} onEdit={openEdit} />;
  }

  if (viewMode === "edit" && selected) {
    return <EditUserPage user={selected} onBack={goList} />;
  }

  return (
    <div className="space-y-6 animate-page-in">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng người dùng",
            value: users.length,
            color: "bg-indigo-50 text-indigo-700",
            icon: "👥",
          },
          {
            label: "Hoạt động",
            value: users.filter((u) => u.status === "active").length,
            color: "bg-green-50 text-green-700",
            icon: "✅",
          },
          {
            label: "Bị khóa",
            value: users.filter((u) => u.status === "blocked").length,
            color: "bg-red-50 text-red-700",
            icon: "🚫",
          },
          {
            label: "Người dùng",
            value: users.filter((u) => u.role === "user").length,
            color: "bg-blue-50 text-blue-700",
            icon: "🛍️",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`${s.color} rounded-2xl p-4 flex items-center gap-3 animate-card-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-75">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Tìm tên, email, số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as "all" | UserRole);
              setPage(1);
            }}
          >
            <option value="all">Tất cả vai trò</option>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | UserStatus);
              setPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(STATUS_LABELS) as UserStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-card-in delay-250">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Danh sách người dùng
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length})
            </span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Người dùng</th>
                <th className="px-6 py-3 text-left">Số điện thoại</th>
                <th className="px-6 py-3 text-center">Vai trò</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-left">Ngày tham gia</th>
                <th className="px-6 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {u._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {u.name.split(" ").pop()?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {u.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${ROLE_COLORS[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[u.status]}`}
                      >
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openView(u)}
                          className="px-2.5 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{" "}
            người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${page === p ? "bg-indigo-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {viewMode === "delete" && selected && (
        <DeleteUserModal
          user={selected}
          onClose={closeDelete}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
