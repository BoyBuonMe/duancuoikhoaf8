import { httpClient } from "@/utils/http";
import type { AuthUser } from "@/features/auth/model/auth.types";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  verificationToken?: string;
  verificationUrl?: string;
};
export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export type ResendVerificationResponse = {
  message: string;
  verificationToken?: string;
  verificationUrl?: string;
};

/** Auth endpoints return `{ token, user }`, not the `{ data }` envelope used elsewhere. */
export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  return data;
}

export async function registerApi(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<RegisterResponse> {
  const { data } = await httpClient.post<RegisterResponse>("/auth/register", {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    name: payload.name?.trim() ?? "",
  });
  return data;
}

export async function googleLoginApi(
  credential: string,
): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>("/auth/google", {
    credential,
  });
  return data;
}

export async function logoutApi(): Promise<void> {
  await httpClient.post("/auth/logout");
}

export async function meApi(): Promise<AuthUser> {
  const { data } = await httpClient.get<{ user: AuthUser }>("/users/me");
  return data.user;
}

export async function forgotPasswordApi(
  email: string,
): Promise<ForgotPasswordResponse> {
  const { data } = await httpClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email: email.trim().toLowerCase() },
  );
  return data;
}

export async function resetPasswordApi(
  token: string,
  password: string,
): Promise<ResetPasswordResponse> {
  const { data } = await httpClient.post<ResetPasswordResponse>(
    "/auth/reset-password",
    { token, password },
  );
  return data;
}

export async function verifyEmailApi(
  token: string,
): Promise<VerifyEmailResponse> {
  const { data } = await httpClient.post<VerifyEmailResponse>(
    "/auth/verify-email",
    { token },
  );
  return data;
}

export async function resendVerificationApi(
  email: string,
): Promise<ResendVerificationResponse> {
  const { data } = await httpClient.post<ResendVerificationResponse>(
    "/auth/resend-verification",
    { email: email.trim().toLowerCase() },
  );
  return data;
}
