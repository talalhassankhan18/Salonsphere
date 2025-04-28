'use client';

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <main className="container mx-auto px-4 py-8">
                <Toaster />
                <Sonner />
                {children}
              </main>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      );
    }