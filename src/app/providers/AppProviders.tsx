"use client";

// All client-side context providers for the app, in one place, so the root
// layout can stay a server component (and export `metadata`).

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { CartStoreProvider } from "@/store/cartStoreContext";
import CookieBanner from "@/common/cookie-banner";
import ToastComponent from "../components/toast-component";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartStoreProvider>
      <SessionProvider>
        <AuthProvider>
          {children}
          <ToastComponent />
          <CookieBanner />
        </AuthProvider>
      </SessionProvider>
    </CartStoreProvider>
  );
}
