"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthFloatingInput } from "@/components/auth/AuthFloatingInput";
import {
  authSubmitButtonClassName,
  getAuthFormErrorMessage,
} from "@/components/auth/auth-form-shared";
import { GymsharkLogo } from "@/components/auth/GymsharkLogo";
import { resetPasswordApi } from "@/features/auth/api/auth.api";

type NewPasswordFormProps = {
  token?: string;
};

export function NewPasswordForm({ token }: NewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Password reset link is missing or invalid.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordApi(token, password);
      setIsSubmitted(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getAuthFormErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-16">
      <GymsharkLogo className="mb-6" />

      <h1 className="text-base font-bold uppercase tracking-[0.12em] text-store-ink-strong">
        Create new password
      </h1>

      {isSubmitted ? (
        <div className="mt-10 flex w-full flex-col items-center text-center">
          <p className="text-sm leading-relaxed text-store-fg-muted">
            Your password has been reset. You can now log in with your new
            password.
          </p>
          <Link
            href="/account/login"
            className={`${authSubmitButtonClassName} inline-flex items-center justify-center`}
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full flex-col gap-4"
          noValidate
        >
          <AuthFloatingInput
            id="new-password"
            label="New password*"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <AuthFloatingInput
            id="confirm-new-password"
            label="Confirm password*"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

          {error ? (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className={authSubmitButtonClassName}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      {!isSubmitted ? (
        <p className="mt-8 text-center text-sm text-store-ink">
          Need a new link?{" "}
          <Link
            href="/account/forgot-password"
            className="font-semibold underline underline-offset-2 hover:text-store-fg-muted"
          >
            Request password reset
          </Link>
        </p>
      ) : null}
    </div>
  );
}
