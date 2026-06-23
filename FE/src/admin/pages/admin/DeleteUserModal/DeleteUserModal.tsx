"use client";

import type { AdminUser } from "@/admin/services/admin/adminUsersService";

type Props = {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export default function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="w-full max-w-5xl rounded-lg bg-white shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            Xóa người dùng
          </h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl shrink-0">
              🗑️
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Bạn có chắc chắn muốn xóa người dùng này không? Hành động này
                không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Tên: </span>
              <span className="font-medium text-gray-800">{user.name}</span>
            </p>
            <p>
              <span className="text-gray-500">Email: </span>
              <span className="font-medium text-gray-800">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:w-auto"
          >
            {isDeleting ? "Đang xóa..." : "Xóa người dùng"}
          </button>
        </div>
      </div>
    </div>
  );
}
