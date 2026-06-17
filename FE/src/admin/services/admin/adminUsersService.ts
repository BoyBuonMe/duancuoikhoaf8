import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "@/admin/utils/http";

export type UserRole = "boss" | "admin" | "user";
export type UserStatus = "active" | "blocked";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

type RawAdminUser = AdminUser & {
  phoneNumber?: string;
  phone_number?: string;
  mobile?: string;
  tel?: string;
};

export interface ListUsersParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

export const getUsers = createAsyncThunk(
  "adminUsers/getUsers",
  async (params: ListUsersParams | undefined, { rejectWithValue }) => {
    try {
      const response = await http.get<{ users: RawAdminUser[] }>(
        "/admin/users",
        { params },
      );
      return {
        users: response.users.map(normalizeAdminUser),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Loi tai danh sach users";
      return rejectWithValue(msg);
    }
  },
);

export const editUser = createAsyncThunk(
  "adminUsers/editUser",
  async (
    { id, payload }: { id: string; payload: UpdateUserPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await http.patch<{ user: RawAdminUser }>(
        `/admin/users/${id}`,
        payload,
      );
      return {
        user: normalizeAdminUser(response.user),
      };
    } catch (e: unknown) {
      const responseMessage =
        axios.isAxiosError<{ message?: string; error?: string }>(e)
          ? e.response?.data?.message ?? e.response?.data?.error
          : undefined;
      const msg =
        responseMessage ??
        (e instanceof Error ? e.message : "Loi cap nhat user");
      return rejectWithValue(msg);
    }
  },
);

function normalizeAdminUser(user: RawAdminUser): AdminUser {
  return {
    ...user,
    phone:
      user.phone ??
      user.phoneNumber ??
      user.phone_number ??
      user.mobile ??
      user.tel ??
      "",
  };
}

export const removeUser = createAsyncThunk(
  "adminUsers/removeUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await http.del(`/admin/users/${id}`);
      return id;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Loi xoa user";
      return rejectWithValue(msg);
    }
  },
);
