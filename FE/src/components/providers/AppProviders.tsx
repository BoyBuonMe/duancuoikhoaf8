"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { ScrollToTopOnNavigate } from "@/components/layout";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ThemeProvider } from "@/components/theme";
import { StoreProvider } from "@/store/StoreProvider";
import { ToastProvider } from "@/shared/context/ToastContext";

export function AppProviders({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const tree = (
    <StoreProvider>
      <ThemeProvider>
        <ToastProvider>
          <ScrollToTopOnNavigate />
          {children}
          <ChatWidget />
        </ToastProvider>
      </ThemeProvider>
    </StoreProvider>
  );

  if (!googleClientId) return tree;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>
  );
}
