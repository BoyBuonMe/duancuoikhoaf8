import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up | Gymshark",
  description:
    "Create a Gymshark account to shop, save wishlists, and track orders.",
};

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-store-paper">
      <RegisterForm />
    </main>
  );
}
