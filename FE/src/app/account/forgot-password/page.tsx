import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | Gymshark",
  description: "Reset your Gymshark account password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-store-paper">
      <ResetPasswordForm />
    </main>
  );
}
