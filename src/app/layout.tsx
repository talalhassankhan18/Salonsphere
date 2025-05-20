"use client";
import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import "swiper/css/bundle";
import { CartStoreProvider } from "@/store/cartStoreContext";
import CookieBanner from "@/common/cookie-banner";
import ToastComponent from "./components/toast-component";
import Providers from "./providers/AuthProvider";

// Import fonts
const poppinsRegular = localFont({
  src: "../fonts/Poppins-Regular.woff",
  variable: "--font-poppins-regular",
  weight: "400",
});

const poppinsBold = localFont({
  src: "../fonts/Poppins-Bold.woff",
  variable: "--font-poppins-bold",
  weight: "700",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      title="SalonSphere"
      suppressHydrationWarning
    >
      <head>
        <title>SalonSphere</title>
        <meta name="description" content="Your SalonSphere application" />
        {/* Favicon for logo */}
        <link rel="icon" href="/assets/images/logo.png" />
        {/* Optional: Support for Apple Touch Icon (for iOS home screen) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Add other meta tags, favicon, etc., here if needed */}
      </head>
      <body
        className={`${poppinsRegular.variable} ${poppinsBold.variable} container mx-auto bg-base-100 antialiased`}
      >
        <CartStoreProvider>
          <Providers>
            {children}
            <ToastComponent />
            <CookieBanner />
          </Providers>
        </CartStoreProvider>
      </body>
    </html>
  );
}
