"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import { getUsers } from "@/admin/features/admin/adminUsersSlice";
import { editUser } from "@/admin/services/admin/adminUsersService";
import type {
  AdminUser,
  UpdateUserPayload,
  UserRole,
  UserStatus,
} from "@/admin/services/admin/adminUsersService";
import {
  createZodResolver,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  type UserFormValues,
  userFormSchema,
} from "@/admin/utils/validate";

type Props = {
  user: AdminUser;
  onBack: () => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  boss: "Boss",
  admin: "Admin",
  user: "Người dùng",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Hoat dong",
  blocked: "Bi khoa",
};

export default function EditUserPage({ user, onBack }: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const canEditFullInfo = currentUser?.role === "boss";
  const schema = useMemo(() => userFormSchema(), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: createZodResolver(schema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
    },
  });

  async function submitForm(values: UserFormValues) {
    setSubmitError(null);

    const payload = canEditFullInfo
      ? ({
          name: values.name.trim(),
          phone: values.phone.trim() || undefined,
          role: values.role,
          status: values.status,
        } satisfies UpdateUserPayload)
      : ({
          role: values.role,
        } satisfies UpdateUserPayload);

    try {
      await dispatch(editUser({ id: user._id, payload })).unwrap();
      await dispatch(getUsers()).unwrap();
      onBack();
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Cập nhật người dùng thất bại",
      );
    }
  }

  return (
    <div className="space-y-5 animate-page-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 animate-slide-left"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Chỉnh sửa người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật thông tin tài khoản người dùng.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(submitForm)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl p-6 animate-card-in delay-150"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ tên
            </label>
            <input
              {...register("name")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
              disabled={!canEditFullInfo}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số điện thoại
            </label>
            <input
              {...register("phone")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
              disabled={!canEditFullInfo}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vai trò
            </label>
            <select
              {...register("role")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {USER_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Trạng thái
            </label>
            <select
              {...register("status")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
              disabled={!canEditFullInfo}
            >
              {USER_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {!canEditFullInfo && (
          <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Tài khoản admin chỉ cập nhật quyền role. Boss mới có quyền sửa đầy
            đủ thông tin người dùng.
          </p>
        )}

        {submitError && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
