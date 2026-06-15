import type { AuthUser } from "@/features/auth/model/auth.types";

const DEFAULT_ADMIN_DASHBOARD_URL = "http://localhost:3000/admin";

export function isDashboardUser(user: AuthUser): boolean {
  return user.role === "admin" || user.role === "boss";
}

export function adminDashboardUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL ||
    DEFAULT_ADMIN_DASHBOARD_URL
  );
}
