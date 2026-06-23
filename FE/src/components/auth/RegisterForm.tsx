"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFloatingInput } from "@/components/auth/AuthFloatingInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  authSubmitButtonClassName,
  getAuthFormErrorMessage,
} from "@/components/auth/auth-form-shared";
import { GymsharkLogo } from "@/components/auth/GymsharkLogo";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/components/auth/validate";
import {
  registerApi,
  resendVerificationApi,
} from "@/features/auth/api/auth.api";
import { useToast } from "@/shared/context/ToastContext";

export function RegisterForm() {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendVerificationMessage, setResendVerificationMessage] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      marketingOptIn: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    setResendVerificationMessage(null);
    const name = [values.firstName?.trim(), values.lastName?.trim()]
      .filter(Boolean)
      .join(" ");
    const email = values.email.trim().toLowerCase();
    try {
      const res = await registerApi({
        email,
        password: values.password,
        name,
        phone: values.phone.trim(),
      });
      setRegisteredEmail(email);
      setVerificationMessage(res.verificationUrl ?? res.message);
      toast.success("Account registered! Check your email to verify.");
    } catch (err) {
      const msg = getAuthFormErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  }

  async function resendVerification() {
    if (!registeredEmail) return;

    setServerError(null);
    setResendVerificationMessage(null);
    setIsResendingVerification(true);

    try {
      const res = await resendVerificationApi(registeredEmail);
      if (res.verificationUrl) {
        setVerificationMessage(res.verificationUrl);
      }
      setResendVerificationMessage("Verification email has been resent.");
      toast.success("Verification email resent successfully.");
    } catch (err) {
      const msg = getAuthFormErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsResendingVerification(false);
    }
  }

  function openDatePicker() {
    const input = document.getElementById("register-dob");
    if (!(input instanceof HTMLInputElement)) return;

    input.focus();
    input.showPicker?.();
  }

  if (verificationMessage) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center sm:py-16">
        <GymsharkLogo className="mb-6" />
        <h1 className="text-base font-bold uppercase tracking-[0.12em] text-store-ink-strong">
          Check your email
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-store-fg-muted">
          We&apos;ve sent a verification link to{" "}
          {registeredEmail ? (
            <span className="font-medium text-store-ink">
              {registeredEmail}
            </span>
          ) : (
            "your email address"
          )}
          . Please check your inbox to complete your account setup.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-store-fg-muted">
          Can&apos;t find the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={resendVerification}
            disabled={isResendingVerification || !registeredEmail}
            className="font-semibold text-store-ink underline underline-offset-2 hover:text-store-fg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResendingVerification
              ? "sending..."
              : "click here to send again"}
          </button>
          .
        </p>
        {resendVerificationMessage ? (
          <p role="status" className="mt-3 text-sm text-store-fg-muted">
            {resendVerificationMessage}
          </p>
        ) : null}
        {serverError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}
        <Link
          href="/account/login"
          className={`${authSubmitButtonClassName} mt-8 inline-flex justify-center`}
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-16">
      <GymsharkLogo className="mb-6" />

      <h1 className="text-base font-bold uppercase tracking-[0.12em] text-store-ink-strong">
        Gymshark signup
      </h1>

      <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-store-fg-muted">
        One account, across all apps, just to make things a little easier.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 flex w-full flex-col gap-4"
        noValidate
      >
        <AuthFloatingInput
          id="register-first-name"
          label="First Name"
          type="text"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <AuthFloatingInput
          id="register-last-name"
          label="Last Name"
          type="text"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <AuthFloatingInput
          id="register-dob"
          label="Date Of Birth"
          type="date"
          autoComplete="bday"
          className="[&::-webkit-calendar-picker-indicator]:hidden"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
              onClick={openDatePicker}
              className="text-store-fg-muted hover:text-store-ink"
              aria-label="Choose date of birth"
            >
              <Calendar className="size-5" strokeWidth={1.5} />
            </button>
          }
        />

        <AuthFloatingInput
          id="register-phone"
          label="Phone number*"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <AuthFloatingInput
          id="register-email"
          label="Email address*"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthFloatingInput
          id="register-password"
          label="Password*"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
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
          id="register-confirm-password"
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          endAdornment={
            <button
              type="button"
              tabIndex={-1}
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

        <label className="flex cursor-pointer items-start gap-3 text-left text-xs leading-relaxed text-store-fg-muted">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-store-border accent-store-ink-strong"
            {...register("marketingOptIn")}
          />
          <span>
            Tick here to receive emails about our products, apps, sales,
            exclusive content and more. See our{" "}
            <Link
              href="/legal/privacy"
              className="text-store-ink underline underline-offset-2 hover:text-store-fg-muted"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {serverError ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={authSubmitButtonClassName}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 w-full">
        <GoogleAuthButton onError={setServerError} />
      </div>

      <p className="mt-8 text-center text-sm text-store-ink">
        Already have an account?{" "}
        <Link
          href="/account/login"
          className="font-semibold underline underline-offset-2 hover:text-store-fg-muted"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
