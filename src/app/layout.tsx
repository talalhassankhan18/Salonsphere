import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "swiper/css/bundle";
import AppProviders from "./providers/AppProviders";

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

export const metadata: Metadata = {
  title: {
    default: "SalonSphere",
    template: "%s | SalonSphere",
  },
  description:
    "Discover and book salon services, shop self-care products, and manage your salon — all in one place.",
  applicationName: "SalonSphere",
  icons: {
    icon: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      {/*
        suppressHydrationWarning on <body>: browser extensions (ColorZilla adds
        cz-shortcut-listen, Grammarly adds data-gr-*, etc.) inject attributes
        before React hydrates. It only silences attribute diffs on this element,
        not on any children, so real hydration bugs still surface.
      */}
      <body
        suppressHydrationWarning
        className={`${poppinsRegular.variable} ${poppinsBold.variable} container mx-auto bg-base-100 antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
