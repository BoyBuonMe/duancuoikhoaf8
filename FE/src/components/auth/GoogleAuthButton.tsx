"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { googleLoginApi } from "@/features/auth/api/auth.api";
import {
  adminDashboardUrl,
  isDashboardUser,
} from "@/features/auth/model/auth-redirect";
import { useAuth } from "@/features/auth/model/useAuth";
import { getAuthFormErrorMessage } from "@/components/auth/auth-form-shared";
import { useToast } from "@/shared/context/ToastContext";

type GoogleAuthButtonProps = {
  onError: (message: string) => void;
};

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { setSession } = useAuth();
  const toast = useToast();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-store-fg-muted">
        <span className="h-px flex-1 bg-store-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-store-border" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          text="continue_with"
          width="360"
          onSuccess={async ({ credential }) => {
            if (!credential) {
              onError("Google did not return a valid credential.");
              return;
            }

            try {
              const { token, user } = await googleLoginApi(credential);
              setSession(user, token);
              toast.success(`Welcome back, ${user.name || "User"}!`);
              if (isDashboardUser(user)) {
                window.location.href = adminDashboardUrl();
                return;
              }
              router.push("/account");
              router.refresh();
            } catch (err) {
              const msg = getAuthFormErrorMessage(err);
              onError(msg);
              toast.error(msg);
            }
          }}
          onError={() => {
            const msg = "Google sign in was cancelled or failed.";
            onError(msg);
            toast.error(msg);
          }}
        />
      </div>
    </div>
  );
}
