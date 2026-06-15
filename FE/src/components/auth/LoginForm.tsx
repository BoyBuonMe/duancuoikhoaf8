"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFloatingInput } from "@/components/auth/AuthFloatingInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  authSubmitButtonClassName,
  getAuthFormErrorCode,
  getAuthFormErrorMessage,
} from "@/components/auth/auth-form-shared";
import { GymsharkLogo } from "@/components/auth/GymsharkLogo";
import { loginSchema, type LoginFormValues } from "@/components/auth/validate";
import {
  loginApi,
  resendVerificationApi,
} from "@/features/auth/api/auth.api";
import {
  adminDashboardUrl,
  isDashboardUser,
} from "@/features/auth/model/auth-redirect";
import { useAuth } from "@/features/auth/model/useAuth";
import { useToast } from "@/shared/context/ToastContext";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setUnverifiedEmail(null);
    setResendMessage(null);
    try {
      const { token, user } = await loginApi(values.email, values.password);
      setSession(user, token);
      toast.success(`Welcome back, ${user.name || "User"}!`);
      if (isDashboardUser(user)) {
        window.location.href = adminDashboardUrl();
        return;
      }
      router.push("/account");
      router.refresh();
    } catch (err) {
      if (getAuthFormErrorCode(err) === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(values.email.trim().toLowerCase());
      }
      const msg = getAuthFormErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  }

  async function resendVerification() {
    if (!unverifiedEmail) return;
    setServerError(null);
    setResendMessage(null);
    try {
      const res = await resendVerificationApi(unverifiedEmail);
      setResendMessage(res.verificationUrl ?? res.message);
      toast.success("Verification email resent successfully.");
    } catch (err) {
      const msg = getAuthFormErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-16">
      <GymsharkLogo className="mb-6" />

      <h1 className="text-base font-bold uppercase tracking-[0.12em] text-store-ink-strong">
        Gymshark login
      </h1>

      <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-store-fg-muted">
        Shop your styles, save top picks to your wishlist, track those orders &
        train with us.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 flex w-full flex-col gap-4"
        noValidate
      >
        <AuthFloatingInput
          id="login-email"
          label="Email address*"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthFloatingInput
          id="login-password"
          label="Password*"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-store-fg-muted hover:text-store-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-5" strokeWidth={1.5} />
              ) : (
                <Eye className="size-5" strokeWidth={1.5} />
              )}
            </button>
          }
        />

        <div className="text-center">
          <Link
            href="/account/forgot-password"
            className="text-sm text-store-ink underline underline-offset-2 hover:text-store-fg-muted"
          >
            Forgot password?
          </Link>
        </div>

        {serverError ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
            {unverifiedEmail ? (
              <button
                type="button"
                onClick={resendVerification}
                className="text-sm font-semibold text-store-ink underline underline-offset-2 hover:text-store-fg-muted"
              >
                Resend verification email
              </button>
            ) : null}
          </div>
        ) : null}

        {resendMessage ? (
          <p className="break-all text-center text-sm text-store-fg-muted">
            {resendMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={authSubmitButtonClassName}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="mt-6 w-full">
        <GoogleAuthButton onError={setServerError} />
      </div>

      <p className="mt-8 text-center text-sm text-store-ink">
        Don&apos;t have an account?{" "}
        <Link
          href="/account/register"
          className="font-semibold underline underline-offset-2 hover:text-store-fg-muted"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
