"use client";

import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthFloatingInput } from "@/components/auth/AuthFloatingInput";
import {
  authSubmitButtonClassName,
  getAuthFormErrorMessage,
} from "@/components/auth/auth-form-shared";
import { GymsharkLogo } from "@/components/auth/GymsharkLogo";
import { forgotPasswordApi } from "@/features/auth/api/auth.api";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPasswordApi(normalizedEmail);
      setEmail(normalizedEmail);
      setIsSubmitted(true);
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
        Reset password
      </h1>

      <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-store-fg-muted">
        Enter your account email and we&apos;ll send instructions to get you
        back in.
      </p>

      {isSubmitted ? (
        <div className="mt-10 flex w-full flex-col items-center text-center">
          <CheckCircle2
            className="size-10 text-store-ink-strong"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-5 text-sm leading-relaxed text-store-fg-muted">
            If an account exists for <span className="text-store-ink">{email}</span>,
            password reset instructions have been sent.
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
            id="reset-password-email"
            label="Email address*"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            endAdornment={
              <Mail
                className="size-5 text-store-fg-muted"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            }
          />

          {error ? (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={authSubmitButtonClassName}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      {!isSubmitted ? (
        <p className="mt-8 text-center text-sm text-store-ink">
          Remembered your password?{" "}
          <Link
            href="/account/login"
            className="font-semibold underline underline-offset-2 hover:text-store-fg-muted"
          >
            Log in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
