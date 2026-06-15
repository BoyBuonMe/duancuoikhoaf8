"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GymsharkLogo } from "@/components/auth/GymsharkLogo";
import { authSubmitButtonClassName } from "@/components/auth/auth-form-shared";
import { verifyEmailApi } from "@/features/auth/api/auth.api";

type VerifyState = "loading" | "success" | "error";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const missingToken = !token;
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    let cancelled = false;

    if (missingToken) return;

    verifyEmailApi(token)
      .then((res) => {
        if (!cancelled) {
          setState("success");
          setMessage(res.message);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState("error");
          setMessage("This verification link is invalid or has expired.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [missingToken, token]);

  const displayState = missingToken ? "error" : state;
  const displayMessage = missingToken
    ? "Verification token is missing."
    : message;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center sm:py-16">
      <GymsharkLogo className="mb-6" />
      <h1 className="text-base font-bold uppercase tracking-[0.12em] text-store-ink-strong">
        {displayState === "success" ? "Email verified" : "Verify email"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-store-fg-muted">
        {displayMessage}
      </p>
      {displayState !== "loading" ? (
        <Link
          href="/account/login"
          className={`${authSubmitButtonClassName} mt-8 inline-flex justify-center`}
        >
          Back to login
        </Link>
      ) : null}
    </div>
  );
}
