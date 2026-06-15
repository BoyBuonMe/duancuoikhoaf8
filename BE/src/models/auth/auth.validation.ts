import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().max(120).optional().default(""),
});

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const googleAuthBodySchema = z.object({
  credential: z.string().trim().min(1, "Google credential is required"),
});

export const verifyEmailBodySchema = z.object({
  token: z.string().trim().min(1, "Verification token is required"),
});

export const resendVerificationBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type GoogleAuthBody = z.infer<typeof googleAuthBodySchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;
export type ResendVerificationBody = z.infer<
  typeof resendVerificationBodySchema
>;
