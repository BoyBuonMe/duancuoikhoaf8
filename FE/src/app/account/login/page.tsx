import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Gymshark",
  description:
    "Sign in to shop your styles, manage your wishlist, and track orders.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-store-paper">
      <LoginForm />
    </main>
  );
}
