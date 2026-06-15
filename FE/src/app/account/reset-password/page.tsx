import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

export const metadata: Metadata = {
  title: "Create new password | Gymshark",
  description: "Create a new password for your Gymshark account.",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-store-paper">
      <NewPasswordForm token={token} />
    </main>
  );
}
