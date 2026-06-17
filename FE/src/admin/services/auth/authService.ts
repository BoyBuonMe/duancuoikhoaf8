import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "@/admin/utils/http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type AuthErrorPayload = {
  message?: string;
};

type CurrentUserResponse =
  | AuthUser
  | { user: AuthUser }
  | { data: AuthUser }
  | { data: { user: AuthUser } };

export const authLogin = createAsyncThunk<
  { token: string; user: AuthUser },
  LoginPayload,
  { rejectValue: AuthErrorPayload }
>(
  "auth/authLogin",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await http.post<{ token: string; user: AuthUser }>(
        "/auth/login",
        data,
      );
      const { token: accessToken } = response;
      localStorage.setItem("accessToken", accessToken);
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError<AuthErrorPayload>(error)) {
        return rejectWithValue(error.response?.data ?? {});
      }

      return rejectWithValue({ message: "Đăng nhập thất bại" });
    }
  },
);

export const getCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: AuthErrorPayload }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await http.get<CurrentUserResponse>("/users/me");
    const user = normalizeCurrentUser(response);
    return user;
  } catch (error: unknown) {
    if (axios.isAxiosError<AuthErrorPayload>(error)) {
      return rejectWithValue(error.response?.data ?? {});
    }

    return rejectWithValue({ message: "Không lấy được thông tin tài khoản" });
  }
});

function normalizeCurrentUser(response: CurrentUserResponse): AuthUser {
  if ("user" in response) return response.user;
  if ("data" in response) {
    return "user" in response.data ? response.data.user : response.data;
  }
  return response;
}
