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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
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

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
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

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Đang xóa..." : "Xóa người dùng"}
          </button>
        </div>
      </div>
    </div>
  );
}
