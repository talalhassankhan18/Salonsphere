"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Poppins } from "next/font/google";
import LoadingSpinner from "@/common/LoadingSpinner";

// Load the font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const queryClient = new QueryClient();

export default function SalonLayout({ children }: { children: ReactNode }) {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Set fontLoaded to true once client-side rendering occurs
    setFontLoaded(true);
  }, []);

  if (!fontLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className={poppins.className}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <main className="container mx-auto px-4 py-8">
            {children}
            <Sonner />
          </main>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}
